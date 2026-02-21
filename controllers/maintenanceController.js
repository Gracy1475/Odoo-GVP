const db = require('../db');

// Get all maintenance logs
const getMaintenanceLogs = async (req, res) => {
    try {
        const { rows } = await db.query(`
      SELECT m.*, v.plate_number, v.model
      FROM maintenance_logs m
      JOIN vehicles v ON m.vehicle_id = v.id
      ORDER BY m.service_date DESC
    `);
        res.json(rows);
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error while fetching maintenance logs', details: err.message });
    }
};

// Create a maintenance entry
const createMaintenanceEntry = async (req, res) => {
    const { vehicle_id, service_type, category, description, cost, odometer_at_service } = req.body;

    if (!vehicle_id || !service_type || cost === undefined || cost === null || odometer_at_service === undefined || odometer_at_service === null) {
        return res.status(400).json({ error: 'Vehicle, Service Type, Cost, and Odometer are required' });
    }

    try {
        const vehicleRes = await db.query('SELECT status FROM vehicles WHERE id = $1', [parseInt(vehicle_id)]);
        if (vehicleRes.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });

        const vehicleStatus = vehicleRes.rows[0].status;
        if (vehicleStatus === 'On Trip') {
            return res.status(400).json({ error: 'Vehicle is currently on a trip and cannot be serviced' });
        }

        await db.query('BEGIN');

        // Create log entry (Active maintenance initially has no completion_date)
        const logRes = await db.query(
            'INSERT INTO maintenance_logs (vehicle_id, service_type, category, description, cost, odometer_at_service, service_date) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE) RETURNING *',
            [parseInt(vehicle_id), service_type, category || 'Repair', description, parseFloat(cost), parseInt(odometer_at_service)]
        );

        // Automatically set vehicle to 'In Shop'
        await db.query('UPDATE vehicles SET status = $1 WHERE id = $2', ['In Shop', parseInt(vehicle_id)]);

        await db.query('COMMIT');
        res.status(201).json(logRes.rows[0]);

    } catch (err) {
        await db.query('ROLLBACK');
        console.error('DATABASE ERROR LOGGING MAINTENANCE:', err);
        res.status(500).json({ error: 'Error logging maintenance', details: err.message });
    }
};

// Complete maintenance (release vehicle)
const completeMaintenance = async (req, res) => {
    const { id } = req.params;

    try {
        const logRes = await db.query('SELECT vehicle_id, odometer_at_service FROM maintenance_logs WHERE id = $1', [parseInt(id)]);
        if (logRes.rows.length === 0) return res.status(404).json({ error: 'Log entry not found' });

        await db.query('BEGIN');

        const { vehicle_id, odometer_at_service } = logRes.rows[0];

        // 1. Mark log as completed
        await db.query(
            'UPDATE maintenance_logs SET completion_date = CURRENT_DATE WHERE id = $1',
            [parseInt(id)]
        );

        // 2. Release vehicle back to Available and update metrics
        await db.query(`
            UPDATE vehicles 
            SET status = $1, 
                last_service_date = CURRENT_DATE, 
                last_service_odometer = $2 
            WHERE id = $3`,
            ['Available', odometer_at_service, parseInt(vehicle_id)]
        );

        await db.query('COMMIT');
        res.json({ message: 'Maintenance completed and vehicle released' });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error('DATABASE ERROR COMPLETING MAINTENANCE:', err);
        res.status(500).json({ error: 'Server error while completing maintenance', details: err.message });
    }
};

module.exports = {
    getMaintenanceLogs,
    createMaintenanceEntry,
    completeMaintenance
};
