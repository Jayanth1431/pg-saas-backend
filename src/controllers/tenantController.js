const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

exports.createTenant = async (req, res) => {
  try {
    const {
      name,
      phone,
      password,
      building_id,
      room_id,
      bed_id,
      rent_amount,
      deposit_amount
    } = req.body;

    const organizationId = req.user.organizationId;

    // Check bed availability
    const bedCheck = await pool.query(
      `SELECT * FROM beds WHERE id = $1`,
      [bed_id]
    );

    if (bedCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid bed" });
    }

    if (bedCheck.rows[0].is_occupied) {
      return res.status(400).json({ message: "Bed already occupied" });
    }

    // Check phone already exists
    const existingUser = await pool.query(
      `SELECT * FROM users WHERE phone = $1`,
      [phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user login
    await pool.query(
      `INSERT INTO users (id, organization_id, role, name, phone, password)
       VALUES ($1, $2, 'tenant', $3, $4, $5)`,
      [userId, organizationId, name, phone, hashedPassword]
    );

    // Create tenant record
    await pool.query(
      `INSERT INTO tenants (
        organization_id,
        user_id,
        building_id,
        room_id,
        bed_id,
        rent_amount,
        deposit_amount,
        status,
        move_in_date
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,'active',CURRENT_DATE)`,
      [
        organizationId,
        userId,
        building_id,
        room_id,
        bed_id,
        rent_amount,
        deposit_amount || 4000
      ]
    );

    // Mark bed as occupied
    await pool.query(
      `UPDATE beds SET is_occupied = true WHERE id = $1`,
      [bed_id]
    );

    res.status(201).json({
      message: "Tenant created and bed assigned successfully"
    });

  } catch (error) {
    console.error("Create Tenant Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};