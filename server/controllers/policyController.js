const Policy = require('../models/Policy');

async function getMyPolicies(req, res) {
  const policies = await Policy.find({ user: req.user._id })
    .populate('service')
    .sort({ createdAt: -1 });

  return res.json(policies);
}

async function getPolicyStatus(req, res) {
  const { number } = req.params;
  const policy = await Policy.findOne({ policyNumber: number })
    .populate('service')
    .populate('user', 'name email');

  if (!policy) {
    return res.status(404).json({ message: 'Полис с таким номером не найден.' });
  }

  const statusLabels = {
    active: 'Активен',
    pending: 'В обработке',
    expired: 'Истёк',
    rejected: 'Отклонён',
  };

  return res.json({
    policyNumber: policy.policyNumber,
    status: policy.status,
    statusLabel: statusLabels[policy.status] || policy.status,
    service: policy.service ? policy.service.title : '—',
    holder: policy.user ? policy.user.name : '—',
    startDate: policy.startDate,
    endDate: policy.endDate,
  });
}

module.exports = { getMyPolicies, getPolicyStatus };
