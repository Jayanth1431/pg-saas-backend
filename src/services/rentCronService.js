const cron = require('node-cron');
const pool = require('../config/db');

// Run on 1st of every month at 12:05 AM
cron.schedule('5 0 1 * *', async () => {
  console.log("🔄 Running Monthly Rent Cron Job...");

  try {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const tenantsResult = await pool.query(
      `SELECT * FROM tenants WHERE status = 'active'`
    );

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
            tenant.organization_id,
            tenant.id,
            tenant.rent_amount,
            month,
            year,
            new Date(year, month - 1, 5)
          ]
        );
      } catch (err) {
        // Skip duplicates (because of UNIQUE constraint)
      }
    }

    console.log("✅ Monthly rent generated successfully");

  } catch (error) {
    console.error("❌ Rent Cron Error:", error.message);
  }
});