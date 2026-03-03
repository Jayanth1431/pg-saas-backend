const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');
require('./services/rentCronService');

const authRoutes = require('./routes/authRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const roomRoutes = require('./routes/roomRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const rentRoutes = require('./routes/rentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const tenantDashboardRoutes = require('./routes/tenantDashboardRoutes');

const { authenticate, authorizeAdmin } = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/rents', rentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/expenses', expenseRoutes);

// Tenant Mobile API
app.use('/api/tenant/dashboard', tenantDashboardRoutes);

app.get(
  '/api/protected',
  authenticate,
  authorizeAdmin,
  (req, res) => {
    res.json({ message: "Welcome Admin 🔐" });
  }
);

app.get('/', (req, res) => {
  res.send('PG SaaS Backend Running 🚀');
});

module.exports = app;