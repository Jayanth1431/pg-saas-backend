const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Create Building (Admin Only)
exports.createBuilding = async (req, res) => {
  try {
    const { name, address, total_floors } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Building name is required" });
    }

    const organizationId = req.user.organizationId;
    const buildingId = uuidv4();

    await pool.query(
      `INSERT INTO buildings
       (id, organization_id, name, address, total_floors)
       VALUES ($1, $2, $3, $4, $5)`,
      [buildingId, organizationId, name, address, total_floors]
    );

    res.status(201).json({
      message: "Building created successfully",
      building_id: buildingId
    });

  } catch (error) {
    console.error("Create Building Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Buildings (Admin Only)
exports.getBuildings = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const buildings = await pool.query(
      `SELECT * FROM buildings WHERE organization_id = $1`,
      [organizationId]
    );

    res.json(buildings.rows);
  } catch (error) {
    console.error("Get Buildings Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};