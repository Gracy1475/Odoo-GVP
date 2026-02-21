const db = require('../db');

// Get all fuel logs
const getFuelLogs = async (req, res) => {
    try {
        const { rows } = await db.query(`
      SELECT f.*, v.plate_number, v.model, t.id as trip_id
      FROM fuel_logs f
      JOIN vehicles v ON f.vehicle_id = v.id
      LEFT JOIN trips t ON f.trip_id = t.id
      ORDER BY f.log_date DESC
    `);
        res.json(rows);
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error while fetching fuel logs', details: err.message });
    }
};

// Create a fuel log entry
const createFuelLog = async (req, res) => {
    const { vehicle_id, trip_id, liters, cost, odometer_reading } = req.body;

    if (!vehicle_id || !liters || !cost) {
        return res.status(400).json({ error: 'Vehicle, Liters, and Cost are required' });
    }

    try {
        const { rows } = await db.query(
            `INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, odometer_reading, log_date) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE) RETURNING *`,
            [
                parseInt(vehicle_id),
                trip_id ? parseInt(trip_id) : null,
                parseFloat(liters),
                parseFloat(cost),
                odometer_reading ? parseInt(odometer_reading) : null
            ]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('DATABASE ERROR LOGGING FUEL:', err);
        res.status(500).json({ error: 'Error logging fuel entry', details: err.message });
    }
};

module.exports = {
    getFuelLogs,
    createFuelLog
};
