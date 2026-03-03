const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ✅ Only ADMIN can create room
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  roomController.createRoom
);

// ✅ Only ADMIN can view rooms
router.get(
  "/:building_id",
  authMiddleware,
  roleMiddleware(["admin"]),
  roomController.getRoomsByBuilding
);

module.exports = router;