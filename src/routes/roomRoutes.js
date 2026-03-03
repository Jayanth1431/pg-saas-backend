const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");

// Create room (Admin only)
router.post("/", authMiddleware, roomController.createRoom);

// Get rooms by building
router.get("/:building_id", authMiddleware, roomController.getRoomsByBuilding);

module.exports = router;