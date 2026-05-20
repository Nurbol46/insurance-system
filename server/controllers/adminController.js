const User = require('../models/User');
const Application = require('../models/Application');
const Policy = require('../models/Policy');
const Service = require('../models/Service');

async function getClients(req, res) {
  const clients = await User.find({ role: 'client' })
    .select('-password')
    .sort({ createdAt: -1 });

  return res.json(clients);
}

async function getStatistics(req, res) {
  const [clients, services, applications, policies, pendingApps, approvedApps] =
    await Promise.all([
      User.countDocuments({ role: 'client' }),
      Service.countDocuments(),
      Application.countDocuments(),
      Policy.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ status: 'approved' }),
    ]);

  return res.json({
    clients,
    services,
    applications,
    policies,
    pendingApplications: pendingApps,
    approvedApplications: approvedApps,
  });
}

module.exports = { getClients, getStatistics };
