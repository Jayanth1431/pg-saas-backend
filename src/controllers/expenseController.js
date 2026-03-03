const pool = require('../config/db');


// ===============================
// ADD EXPENSE
// ===============================
exports.addExpense = async (req, res) => {
  try {
    const { category, amount, description } = req.body;
    const organizationId = req.user.organizationId;

    await pool.query(
      `INSERT INTO expenses 
       (organization_id, category, amount, expense_date)
       VALUES ($1,$2,$3,CURRENT_DATE)`,
      [organizationId, category, amount]
    );

    res.status(201).json({ message: "Expense added successfully" });

  } catch (error) {
    console.error("Add Expense Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



// ===============================
// GET EXPENSES
// ===============================
exports.getExpenses = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const result = await pool.query(
      `SELECT * FROM expenses
       WHERE organization_id = $1
       ORDER BY expense_date DESC`,
      [organizationId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Get Expenses Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};