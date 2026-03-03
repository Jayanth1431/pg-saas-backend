const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Only admin can create rooms
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  roomController.createRoom
);

// Both admin and tenant can view rooms (example)
router.get(
  "/:building_id",
  authMiddleware,
  roleMiddleware(["admin", "tenant"]),
  roomController.getRoomsByBuilding
);

module.exports = router;