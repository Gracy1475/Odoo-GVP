const db = require('../db');

// Get all trips
const getTrips = async (req, res) => {
    try {
        const { rows } = await db.query(`
      SELECT t.*, v.plate_number, d.full_name as driver_name 
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      ORDER BY t.created_at DESC
    `);
        res.json(rows);
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error while fetching trips', details: err.message });
    }
};

// Create a new trip (can be Draft or Dispatched)
const createTrip = async (req, res) => {
    const { vehicle_id, driver_id, cargo_weight_kg, revenue, origin_address, destination_address, status } = req.body;

    try {
        // If status is 'Dispatched', perform full validation
        if (status === 'Dispatched') {
            if (!vehicle_id || !driver_id) {
                return res.status(400).json({ error: 'Vehicle and Driver are required for Dispatch' });
            }

            // 1. Validation Logic: Check Vehicle Capacity & Status
            const vehicleRes = await db.query('SELECT max_load_capacity_kg, status FROM vehicles WHERE id = $1', [vehicle_id]);
            const vehicle = vehicleRes.rows[0];

            if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
            if (vehicle.status !== 'Available') return res.status(400).json({ error: 'Vehicle is not available' });
            if (parseFloat(cargo_weight_kg) > parseFloat(vehicle.max_load_capacity_kg)) {
                return res.status(400).json({ error: `Cargo exceeds capacity (${vehicle.max_load_capacity_kg}kg)` });
            }

            // 2. Validation Logic: Check Driver Status
            const driverRes = await db.query('SELECT status, license_expiry FROM drivers WHERE id = $1', [driver_id]);
            const driver = driverRes.rows[0];

            if (!driver) return res.status(404).json({ error: 'Driver not found' });
            if (driver.status !== 'On Duty') return res.status(400).json({ error: 'Driver is not on duty/available' });

            if (new Date(driver.license_expiry) < new Date()) {
                return res.status(400).json({ error: 'Driver license has expired' });
            }

            // 3. Start Transaction
            await db.query('BEGIN');
            const tripRes = await db.query(
                'INSERT INTO trips (vehicle_id, driver_id, cargo_weight_kg, revenue, origin_address, destination_address, status, dispatch_date) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING *',
                [vehicle_id, driver_id, cargo_weight_kg, revenue || 0, origin_address, destination_address, 'Dispatched']
            );
            await db.query('UPDATE vehicles SET status = $1 WHERE id = $2', ['On Trip', vehicle_id]);
            await db.query('UPDATE drivers SET status = $1 WHERE id = $2', ['On Trip', driver_id]);
            await db.query('COMMIT');
            return res.status(201).json(tripRes.rows[0]);
        }

        // Otherwise, save as Draft
        const tripRes = await db.query(
            'INSERT INTO trips (vehicle_id, driver_id, cargo_weight_kg, revenue, origin_address, destination_address, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [vehicle_id || null, driver_id || null, cargo_weight_kg, revenue || 0, origin_address, destination_address, 'Draft']
        );
        res.status(201).json(tripRes.rows[0]);

    } catch (err) {
        if (req.body.status === 'Dispatched') await db.query('ROLLBACK');
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error while creating trip', details: err.message });
    }
};

// Update an existing trip (Assign driver/vehicle to draft)
const updateTrip = async (req, res) => {
    const { id } = req.params;
    const { vehicle_id, driver_id, cargo_weight_kg, revenue, origin_address, destination_address, status } = req.body;

    try {
        const currentTripRes = await db.query('SELECT status FROM trips WHERE id = $1', [id]);
        if (currentTripRes.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });

        const currentStatus = currentTripRes.rows[0].status;

        // If transitioning to Dispatched, run full checks
        if (status === 'Dispatched' && currentStatus === 'Draft') {
            // Re-run the same validation as createTrip
            const vehicleRes = await db.query('SELECT max_load_capacity_kg, status FROM vehicles WHERE id = $1', [vehicle_id]);
            const vehicle = vehicleRes.rows[0];
            if (!vehicle || vehicle.status !== 'Available') return res.status(400).json({ error: 'Selected vehicle is unavailable' });
            if (parseFloat(cargo_weight_kg) > parseFloat(vehicle.max_load_capacity_kg)) return res.status(400).json({ error: 'Overload detected' });

            const driverRes = await db.query('SELECT status, license_expiry FROM drivers WHERE id = $1', [driver_id]);
            const driver = driverRes.rows[0];
            if (!driver || driver.status !== 'On Duty') return res.status(400).json({ error: 'Selected driver is unavailable' });

            await db.query('BEGIN');
            const tripRes = await db.query(
                'UPDATE trips SET vehicle_id = $1, driver_id = $2, cargo_weight_kg = $3, revenue = $4, origin_address = $5, destination_address = $6, status = $7, dispatch_date = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
                [vehicle_id, driver_id, cargo_weight_kg, revenue, origin_address, destination_address, 'Dispatched', id]
            );
            await db.query('UPDATE vehicles SET status = $1 WHERE id = $2', ['On Trip', vehicle_id]);
            await db.query('UPDATE drivers SET status = $1 WHERE id = $2', ['On Trip', driver_id]);
            await db.query('COMMIT');
            return res.json(tripRes.rows[0]);
        }

        // Standard update (for Drafts)
        const { rows } = await db.query(
            'UPDATE trips SET vehicle_id = $1, driver_id = $2, cargo_weight_kg = $3, revenue = $4, origin_address = $5, destination_address = $6 WHERE id = $7 RETURNING *',
            [vehicle_id || null, driver_id || null, cargo_weight_kg, revenue, origin_address, destination_address, id]
        );
        res.json(rows[0]);

    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error while updating trip' });
    }
};

// Complete a trip
const completeTrip = async (req, res) => {
    const { id } = req.params;
    const { end_odometer } = req.body;

    try {
        const tripRes = await db.query('SELECT * FROM trips WHERE id = $1', [id]);
        const trip = tripRes.rows[0];

        if (!trip || trip.status !== 'Dispatched') {
            return res.status(400).json({ error: 'Only Dispatched trips can be completed' });
        }

        await db.query('BEGIN');

        // Update Trip
        await db.query(
            'UPDATE trips SET status = $1, end_odometer = $2, completion_date = CURRENT_TIMESTAMP WHERE id = $3',
            ['Completed', end_odometer, id]
        );

        // Update Odometer in Vehicles table
        if (end_odometer) {
            await db.query('UPDATE vehicles SET odometer_km = $1, status = $2 WHERE id = $3', [end_odometer, 'Available', trip.vehicle_id]);
        } else {
            await db.query('UPDATE vehicles SET status = $1 WHERE id = $2', ['Available', trip.vehicle_id]);
        }

        // Release Driver
        await db.query('UPDATE drivers SET status = $1 WHERE id = $2', ['On Duty', trip.driver_id]);

        await db.query('COMMIT');
        res.json({ message: 'Trip completed successfully' });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error while completing trip', details: err.message });
    }
};

// Delete a trip (Only if Draft or Cancelled)
const deleteTrip = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query('DELETE FROM trips WHERE id = $1 AND status IN ($2, $3) RETURNING *', [id, 'Draft', 'Cancelled']);
        if (rows.length === 0) return res.status(400).json({ error: 'Cannot delete active or historical trips' });
        res.json({ message: 'Trip deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while deleting trip' });
    }
};

module.exports = {
    getTrips,
    createTrip,
    updateTrip,
    completeTrip,
    deleteTrip
};
