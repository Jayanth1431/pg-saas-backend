const pool = require('../config/db');


// ===============================
// GENERATE MONTHLY RENT
// ===============================
exports.generateMonthlyRent = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Get all active tenants
    const tenantsResult = await pool.query(
      `SELECT * FROM tenants 
       WHERE organization_id = $1 AND status = 'active'`,
      [organizationId]
    );

    let created = 0;
    let skipped = 0;

    for (const tenant of tenantsResult.rows) {
      try {
        await pool.query(
          `INSERT INTO rents (
            organization_id,
            tenant_id,
            amount,
            month,
            year,
            due_date
          )
          VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            organizationId,
            tenant.id,
            tenant.rent_amount,
            month,
            year,
            new Date(year, month - 1, 5) // Due date = 5th
          ]
        );

        created++;

      } catch (err) {
        // Duplicate rent entry → skip
        skipped++;
      }
    }

    res.json({
      message: "Rent generation completed",
      month,
      year,
      created,
      skipped
    });

  } catch (error) {
    console.error("Rent Generation Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};



// ===============================
// GET ALL RENTS
// ===============================
exports.getRents = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const result = await pool.query(
      `SELECT r.*, u.name 
       FROM rents r
       JOIN tenants t ON r.tenant_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE r.organization_id = $1
       ORDER BY r.year DESC, r.month DESC`,
      [organizationId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Get Rents Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};



// ===============================
// TENANT SUBMIT PAYMENT
// ===============================
exports.submitPayment = async (req, res) => {
  try {
    const { rent_id, payment_reference } = req.body;

    await pool.query(
      `UPDATE rents
       SET status = 'payment_submitted',
           payment_reference = $1
       WHERE id = $2`,
      [payment_reference, rent_id]
    );

    res.json({ message: "Payment submitted for verification" });

  } catch (error) {
    console.error("Submit Payment Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};



// ===============================
// ADMIN VERIFY PAYMENT
// ===============================
exports.verifyPayment = async (req, res) => {
  try {
    const { rent_id } = req.body;
    const adminId = req.user.userId;

    await pool.query(
      `UPDATE rents
       SET status = 'paid',
           paid_date = CURRENT_DATE,
           verified_by = $1
       WHERE id = $2`,
      [adminId, rent_id]
    );

    res.json({ message: "Payment verified successfully" });

  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};