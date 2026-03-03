const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.post(
  '/',
  authenticate,
  authorizeAdmin,
  expenseController.addExpense
);

router.get(
  '/',
  authenticate,
  authorizeAdmin,
  expenseController.getExpenses
);

module.exports = router;