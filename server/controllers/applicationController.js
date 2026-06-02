const Application = require('../models/Application');
const Policy = require('../models/Policy');
const Service = require('../models/Service');
const User = require('../models/User');

function generatePolicyNumber() {
  const part = Date.now().toString().slice(-6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `POL-${part}-${rand}`;
}

async function createApplication(req, res) {
  const { name, email, phone, serviceId, message } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'Заполните все обязательные поля.' });
  }

  let service = null;
  let serviceTitle = req.body.serviceTitle || '';

  if (serviceId) {
    service = await Service.findById(serviceId);
    if (service) {
      serviceTitle = service.title;
    }
  }

  const application = await Application.create({
    user: req.user ? req.user._id : undefined,
    name,
    email,
    phone,
    service: service ? service._id : undefined,
    serviceTitle,
    message: message || '',
    status: 'pending',
  });

  return res.status(201).json({
    message: 'Заявка принята. С вами свяжутся в ближайшее время.',
    application,
  });
}

async function getMyApplications(req, res) {
  const applications = await Application.find({
    $or: [{ user: req.user._id }, { email: req.user.email }],
  })
    .populate('service')
    .sort({ createdAt: -1 });

  return res.json(applications);
}

async function getAllApplications(req, res) {
  const applications = await Application.find()
    .populate('service')
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  return res.json(applications);
}

async function updateApplicationStatus(req, res) {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Некорректный статус.' });
  }

  const application = await Application.findById(req.params.id).populate('service');
  if (!application) {
    return res.status(404).json({ message: 'Заявка не найдена.' });
  }

  application.status = status;
  await application.save();

  if (status === 'approved') {
    const user =
      (application.user ? await User.findById(application.user) : null) ||
      (await User.findOne({ email: application.email.toLowerCase() }));

    if (user) {
      const existing = await Policy.findOne({ application: application._id });
      if (!existing) {
        const now = new Date();
        const end = new Date(now);
        end.setFullYear(end.getFullYear() + 1);

        await Policy.create({
          user: user._id,
          service: application.service,
          application: application._id,
          policyNumber: generatePolicyNumber(),
          status: 'active',
          startDate: now,
          endDate: end,
        });
      }
    }
  }

  if (status === 'rejected') {
    await Policy.updateMany(
      { application: application._id },
      { status: 'rejected' }
    );
  }

  return res.json(application);
}

module.exports = {
  createApplication,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
};
