const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/tripRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const safetyRoutes = require('./routes/safetyRoutes');
const { authenticateToken } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/vehicles', authenticateToken, vehicleRoutes);
app.use('/api/drivers', authenticateToken, driverRoutes);
app.use('/api/trips', authenticateToken, tripRoutes);
app.use('/api/maintenance', authenticateToken, maintenanceRoutes);
app.use('/api/fuel', authenticateToken, fuelRoutes);

// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'FleetFlow API is running', timestamp: new Date() });
});

// Root Route for Guidance
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1>FleetFlow API is Online</h1>
            <p>This is the backend server. To access the user interface, please visit:</p>
            <a href="http://localhost:3000" style="font-size: 1.2rem; color: #2563eb; font-weight: bold;">http://localhost:3000</a>
        </div>
    `);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
