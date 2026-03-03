const express = require('express');
const router = express.Router();
const tenantDashboardController = require('../controllers/tenantDashboardController');
const { authenticate, authorizeTenant } = require('../middleware/authMiddleware');

router.get(
  '/',
  authenticate,
  authorizeTenant,
  tenantDashboardController.getTenantDashboard
);

module.exports = router;