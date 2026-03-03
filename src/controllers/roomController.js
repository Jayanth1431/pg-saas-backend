const pool = require('../config/db');

// CREATE ROOM + AUTO CREATE BEDS
exports.createRoom = async (req, res) => {
  try {
    const { building_id, floor_number, room_number, sharing_type } = req.body;
    const organizationId = req.user.organizationId;

    // Validate sharing type
    if (![1, 2, 3, 4].includes(sharing_type)) {
      return res.status(400).json({ message: "Invalid sharing type" });
    }

    // Check building belongs to this organization
    const buildingCheck = await pool.query(
      `SELECT * FROM buildings 
       WHERE id = $1 AND organization_id = $2`,
      [building_id, organizationId]
    );

    if (buildingCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid building" });
    }

    // Insert room
    const roomResult = await pool.query(
      `INSERT INTO rooms 
       (building_id, floor_number, room_number, sharing_type, total_beds)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [building_id, floor_number, room_number, sharing_type, sharing_type]
    );

    const room = roomResult.rows[0];

    // Auto create beds
    for (let i = 1; i <= sharing_type; i++) {
      await pool.query(
        `INSERT INTO beds (room_id, bed_number)
         VALUES ($1, $2)`,
        [room.id, i]
      );
    }

    res.status(201).json({
      message: "Room created successfully",
      room
    });

  } catch (error) {
    console.error("Create Room Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};


// GET ALL ROOMS BY BUILDING
exports.getRooms = async (req, res) => {
  try {
    const { building_id } = req.query;

    const result = await pool.query(
      `SELECT r.*, b.name as building_name
       FROM rooms r
       JOIN buildings b ON r.building_id = b.id
       WHERE r.building_id = $1
       ORDER BY r.floor_number, r.room_number`,
      [building_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Get Rooms Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};


// GET BEDS BY ROOM
exports.getBedsByRoom = async (req, res) => {
  try {
    const { room_id } = req.query;

    const result = await pool.query(
      `SELECT * FROM beds 
       WHERE room_id = $1
       ORDER BY bed_number`,
      [room_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Get Beds Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};