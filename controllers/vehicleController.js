const db = require('../db');

// Get all vehicles
const getVehicles = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM vehicles ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error while fetching vehicles', details: err.message });
    }
};

// Add a new vehicle
const addVehicle = async (req, res) => {
    const { plate_number, model, vehicle_type, max_load_capacity_kg, acquisition_cost, region, odometer_km } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO vehicles (plate_number, model, vehicle_type, max_load_capacity_kg, acquisition_cost, region, odometer_km, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [plate_number, model, vehicle_type, max_load_capacity_kg, acquisition_cost, region, odometer_km || 0, 'Available']
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Plate number already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error while adding vehicle' });
    }
};

// Update vehicle status (In Shop, Available, etc.)
const updateVehicleStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE vehicles SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while updating status' });
    }
};

// Get specific vehicle details with history
const getVehicleDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const vehicleRes = await db.query('SELECT * FROM vehicles WHERE id = $1', [id]);
        if (vehicleRes.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });

        const vehicle = vehicleRes.rows[0];

        // Fetch recent trips
        const tripsRes = await db.query(
            'SELECT * FROM trips WHERE vehicle_id = $1 ORDER BY created_at DESC LIMIT 5',
            [id]
        );

        // Fetch recent maintenance
        const maintenanceRes = await db.query(
            'SELECT * FROM maintenance_logs WHERE vehicle_id = $1 ORDER BY service_date DESC LIMIT 5',
            [id]
        );

        res.json({
            ...vehicle,
            recent_trips: tripsRes.rows,
            maintenance_history: maintenanceRes.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching vehicle details' });
    }
};

// Delete a vehicle
const deleteVehicle = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.json({ message: 'Vehicle deleted successfully', vehicle: rows[0] });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Cannot delete vehicle because it has associated trips or maintenance records. Consider retiring it instead.' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error while deleting vehicle' });
    }
};

// Update status logic removed to enforce rule-based transitions (Trips/Maintenance)

module.exports = {
    getVehicles,
    addVehicle,
    getVehicleDetails,
    deleteVehicle
};
