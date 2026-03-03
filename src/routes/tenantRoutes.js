const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.post(
  '/',
  authenticate,
  authorizeAdmin,
  tenantController.createTenant
);

module.exports = router;