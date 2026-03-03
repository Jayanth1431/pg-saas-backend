const pool = require('../config/db');

exports.getTenantDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get tenant record
    const tenantResult = await pool.query(
      `SELECT t.*, r.room_number, b.name AS building_name, bd.bed_number
       FROM tenants t
       JOIN rooms r ON t.room_id = r.id
       JOIN buildings b ON t.building_id = b.id
       JOIN beds bd ON t.bed_id = bd.id
       WHERE t.user_id = $1`,
      [userId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ message: "Tenant record not found" });
    }

    const tenant = tenantResult.rows[0];

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Get current month rent
    const rentResult = await pool.query(
      `SELECT * FROM rents 
       WHERE tenant_id = $1
       AND month = $2 AND year = $3`,
      [tenant.id, month, year]
    );

    const rent = rentResult.rows[0] || null;

    res.json({
      tenant_name: tenant.name,
      building_name: tenant.building_name,
      room_number: tenant.room_number,
      bed_number: tenant.bed_number,
      rent_amount: tenant.rent_amount,
      deposit_amount: tenant.deposit_amount,
      current_month_rent: rent
    });

  } catch (error) {
    console.error("Tenant Dashboard Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};