const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.post(
  '/',
  authenticate,
  authorizeAdmin,
  buildingController.createBuilding
);

router.get(
  '/',
  authenticate,
  authorizeAdmin,
  buildingController.getBuildings
);

module.exports = router;