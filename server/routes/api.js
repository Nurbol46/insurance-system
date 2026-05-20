const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const authController = require('../controllers/authController');
const serviceController = require('../controllers/serviceController');
const applicationController = require('../controllers/applicationController');
const policyController = require('../controllers/policyController');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);

router.get('/services', serviceController.getServices);
router.post('/services', protect, adminOnly, serviceController.createService);
router.put('/services/:id', protect, adminOnly, serviceController.updateService);
router.delete('/services/:id', protect, adminOnly, serviceController.deleteService);

router.post('/applications', applicationController.createApplication);
router.get('/applications/my', protect, applicationController.getMyApplications);
router.get('/applications', protect, adminOnly, applicationController.getAllApplications);
router.patch(
  '/applications/:id',
  protect,
  adminOnly,
  applicationController.updateApplicationStatus
);

router.get('/policies/my', protect, policyController.getMyPolicies);
router.get('/policies/status/:number', policyController.getPolicyStatus);

router.get('/admin/clients', protect, adminOnly, adminController.getClients);
router.get('/admin/stats', protect, adminOnly, adminController.getStatistics);

module.exports = router;
