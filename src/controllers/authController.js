const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');


// ===============================
// REGISTER ADMIN
// ===============================
exports.registerAdmin = async (req, res) => {
  try {
    const { organization_name, owner_name, phone, password } = req.body;

    if (!organization_name || !owner_name || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if phone already exists
    const existingUser = await pool.query(
      `SELECT * FROM users WHERE phone = $1`,
      [phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    const orgId = uuidv4();
    const userId = uuidv4();

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization
    await pool.query(
      `INSERT INTO organizations (id, name, owner_name, phone)
       VALUES ($1, $2, $3, $4)`,
      [orgId, organization_name, owner_name, phone]
    );

    // Create admin user
    await pool.query(
      `INSERT INTO users (id, organization_id, role, name, phone, password)
       VALUES ($1, $2, 'admin', $3, $4, $5)`,
      [userId, orgId, owner_name, phone, hashedPassword]
    );

    res.status(201).json({
      message: "Admin Registered Successfully"
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};



// ===============================
// LOGIN USER (ADMIN OR TENANT)
// ===============================
exports.loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required" });
    }

    const userResult = await pool.query(
      `SELECT * FROM users WHERE phone = $1`,
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        organizationId: user.organization_id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};