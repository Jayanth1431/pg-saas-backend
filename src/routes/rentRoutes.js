const express = require('express');
const router = express.Router();
const rentController = require('../controllers/rentController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');


// Generate rent (Admin only)
router.post(
  '/generate',
  authenticate,
  authorizeAdmin,
  rentController.generateMonthlyRent
);


// Get all rents
router.get(
  '/',
  authenticate,
  authorizeAdmin,
  rentController.getRents
);


// Tenant submits payment
router.post(
  '/submit',
  authenticate,
  rentController.submitPayment
);


// Admin verifies payment
router.post(
  '/verify',
  authenticate,
  authorizeAdmin,
  rentController.verifyPayment
);

module.exports = router;