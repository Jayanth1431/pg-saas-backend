const pool = require('../config/db');

exports.createBuilding = async (req, res) => {
  try {
    const { name, total_floors } = req.body;
    const organizationId = req.user.organizationId;

    const result = await pool.query(
      `INSERT INTO buildings (organization_id, name, total_floors)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [organizationId, name, total_floors]
    );

    res.status(201).json({
      message: "Building created successfully",
      building: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getBuildings = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const result = await pool.query(
      `SELECT * FROM buildings WHERE organization_id = $1`,
      [organizationId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};