const db = require('../db');

// Get all safety events
const getSafetyEvents = async (req, res) => {
    try {
        const { rows } = await db.query(`
      SELECT s.*, d.full_name as driver_name, v.plate_number
      FROM safety_events s
      JOIN drivers d ON s.driver_id = d.id
      JOIN vehicles v ON s.vehicle_id = v.id
      ORDER BY s.event_date DESC
    `);
        res.json(rows);
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error while fetching safety events' });
    }
};

// Get safety leaderboard (Driver rankings)
const getSafetyLeaderboard = async (req, res) => {
    try {
        const { rows } = await db.query(`
      SELECT 
        d.id, 
        d.full_name, 
        d.safety_score,
        COUNT(s.id) as violations_count,
        MAX(s.event_date) as last_violation
      FROM drivers d
      LEFT JOIN safety_events s ON d.id = s.driver_id
      GROUP BY d.id
      ORDER BY d.safety_score DESC
    `);
        res.json(rows);
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error while fetching leaderboard' });
    }
};

// Log a safety event
const logSafetyEvent = async (req, res) => {
    const { driver_id, vehicle_id, trip_id, event_type, severity, description } = req.body;

    if (!driver_id || !vehicle_id || !event_type) {
        return res.status(400).json({ error: 'Driver, Vehicle, and Event Type are required' });
    }

    try {
        const { rows } = await db.query(
            `INSERT INTO safety_events (driver_id, vehicle_id, trip_id, event_type, severity, description) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [driver_id, vehicle_id, trip_id || null, event_type, severity || 'Low', description]
        );

        // Optional: Logic to automatically penalize the driver's safety_score
        let penalty = 0;
        if (severity === 'High') penalty = 5;
        else if (severity === 'Medium') penalty = 2;
        else penalty = 1;

        await db.query('UPDATE drivers SET safety_score = GREATEST(0, safety_score - $1) WHERE id = $2', [penalty, driver_id]);

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('DATABASE ERROR LOGGING SAFETY EVENT:', err);
        res.status(500).json({ error: 'Error logging safety event' });
    }
};

module.exports = {
    getSafetyEvents,
    getSafetyLeaderboard,
    logSafetyEvent
};
