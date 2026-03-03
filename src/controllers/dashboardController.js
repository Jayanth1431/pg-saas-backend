const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Active tenants
    const tenants = await pool.query(
      `SELECT COUNT(*) FROM tenants 
       WHERE organization_id = $1 AND status = 'active'`,
      [organizationId]
    );

    // Beds
    const beds = await pool.query(
      `SELECT COUNT(*) FROM beds bd
       JOIN rooms r ON bd.room_id = r.id
       JOIN buildings b ON r.building_id = b.id
       WHERE b.organization_id = $1`,
      [organizationId]
    );

    const occupiedBeds = await pool.query(
      `SELECT COUNT(*) FROM beds bd
       JOIN rooms r ON bd.room_id = r.id
       JOIN buildings b ON r.building_id = b.id
       WHERE b.organization_id = $1 AND bd.is_occupied = true`,
      [organizationId]
    );

    // Revenue
    const revenue = await pool.query(
      `SELECT COALESCE(SUM(amount),0) FROM rents
       WHERE organization_id = $1
       AND month = $2 AND year = $3
       AND status = 'paid'`,
      [organizationId, month, year]
    );

    // Pending
    const pending = await pool.query(
      `SELECT COALESCE(SUM(amount),0) FROM rents
       WHERE organization_id = $1
       AND month = $2 AND year = $3
       AND status != 'paid'`,
      [organizationId, month, year]
    );

    // Expenses (Current Month)
    const expenses = await pool.query(
      `SELECT COALESCE(SUM(amount),0) FROM expenses
       WHERE organization_id = $1
       AND EXTRACT(MONTH FROM expense_date) = $2
       AND EXTRACT(YEAR FROM expense_date) = $3`,
      [organizationId, month, year]
    );

    const totalRevenue = parseFloat(revenue.rows[0].coalesce);
    const totalExpenses = parseFloat(expenses.rows[0].coalesce);
    const netProfit = totalRevenue - totalExpenses;

    const totalBedsCount = parseInt(beds.rows[0].count);
    const occupiedBedsCount = parseInt(occupiedBeds.rows[0].count);

    const occupancyRate = totalBedsCount > 0
      ? ((occupiedBedsCount / totalBedsCount) * 100).toFixed(2)
      : 0;

    res.json({
      total_active_tenants: parseInt(tenants.rows[0].count),
      total_beds: totalBedsCount,
      occupied_beds: occupiedBedsCount,
      occupancy_percentage: occupancyRate + "%",
      monthly_revenue: totalRevenue,
      monthly_pending: parseFloat(pending.rows[0].coalesce),
      monthly_expenses: totalExpenses,
      net_profit: netProfit,
      month,
      year
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};