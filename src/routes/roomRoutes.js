const express = require('express');
const router = express.Router();

const roomController = require('../controllers/roomController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');


// CREATE ROOM
router.post(
  '/',
  authenticate,
  authorizeAdmin,
  roomController.createRoom
);


// GET ROOMS BY BUILDING
router.get(
  '/',
  authenticate,
  authorizeAdmin,
  roomController.getRooms
);


// GET BEDS BY ROOM
router.get(
  '/beds',
  authenticate,
  authorizeAdmin,
  roomController.getBedsByRoom
);


module.exports = router;