const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Default rent mapping
const RENT_MAPPING = {
  1: 20000,
  2: 10000,
  3: 8000,
  4: 7000,
};

// Create Room
exports.createRoom = async (req, res) => {
  try {
    const { building_id, room_number, sharing_type, rent_amount } = req.body;

    if (!building_id || !room_number || !sharing_type) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const organizationId = req.user.organizationId;

    // Auto rent if not provided
    const finalRent =
      rent_amount && rent_amount > 0
        ? rent_amount
        : RENT_MAPPING[sharing_type];

    if (!finalRent) {
      return res.status(400).json({ message: "Invalid sharing type" });
    }

    const roomId = uuidv4();

    await pool.query(
      `INSERT INTO rooms
      (id, organization_id, building_id, room_number, sharing_type, rent_amount)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        roomId,
        organizationId,
        building_id,
        room_number,
        sharing_type,
        finalRent,
      ]
    );

    // Auto create beds based on sharing type
    for (let i = 1; i <= sharing_type; i++) {
      await pool.query(
        `INSERT INTO beds (id, room_id, bed_number)
         VALUES ($1, $2, $3)`,
        [uuidv4(), roomId, `Bed-${i}`]
      );
    }

    res.status(201).json({
      message: "Room created successfully",
      room_id: roomId,
      rent_amount: finalRent,
    });

  } catch (error) {
    console.error("Create Room Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Rooms by Building
exports.getRoomsByBuilding = async (req, res) => {
  try {
    const { building_id } = req.params;

    const rooms = await pool.query(
      `SELECT * FROM rooms WHERE building_id = $1`,
      [building_id]
    );

    res.json(rooms.rows);
  } catch (error) {
    console.error("Get Rooms Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};