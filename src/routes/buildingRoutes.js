const express = require("express");
const router = express.Router();
const buildingController = require("../controllers/buildingController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin only
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  buildingController.createBuilding
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  buildingController.getBuildings
);

module.exports = router;