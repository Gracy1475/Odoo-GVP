const db = require('../db');

// Get all drivers
const getDrivers = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM drivers ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error while fetching drivers', details: err.message });
    }
};

// Add a new driver
const addDriver = async (req, res) => {
    const { full_name, license_number, license_expiry, safety_score, status } = req.body;

    // Safety check: new drivers can only be On Duty or Off Duty
    const initialStatus = (status === 'On Duty' || status === 'Off Duty') ? status : 'Off Duty';

    try {
        const { rows } = await db.query(
            'INSERT INTO drivers (full_name, license_number, license_expiry, safety_score, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [full_name, license_number, license_expiry, safety_score || 100, initialStatus]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'License number already exists' });
        }
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error while adding driver', details: err.message });
    }
};

// Update driver status
const updateDriverStatus = async (req, res) => {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    try {
        const currentRes = await db.query('SELECT status, license_expiry FROM drivers WHERE id = $1', [id]);
        if (currentRes.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });

        const currentStatus = currentRes.rows[0].status;
        const expiry = new Date(currentRes.rows[0].license_expiry);

        // 1. Check License Expiry
        if (expiry < new Date() && newStatus !== 'Suspended') {
            return res.status(400).json({ error: 'Driver license expired. Must remain Suspended.' });
        }

        // 2. Block manual change TO 'On Trip'
        if (newStatus === 'On Trip' && currentStatus !== 'On Trip') {
            return res.status(400).json({ error: 'Status "On Trip" can only be set by the Dispatcher.' });
        }

        // 3. Block manual change FROM 'On Trip' (except to Suspended)
        if (currentStatus === 'On Trip' && newStatus !== 'Suspended' && newStatus !== 'On Trip') {
            return res.status(400).json({ error: 'Cannot change status while driver is on a trip. Complete the trip first.' });
        }

        const { rows } = await db.query(
            'UPDATE drivers SET status = $1 WHERE id = $2 RETURNING *',
            [newStatus, id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error while updating status', details: err.message });
    }
};

module.exports = {
    getDrivers,
    addDriver,
    updateDriverStatus
};
