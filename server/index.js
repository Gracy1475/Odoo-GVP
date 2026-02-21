import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => { console.error('❌ MongoDB connection error:', err.message); process.exit(1); });

// ─── Schemas & Models ──────────────────────────────────────────────────────────
const VehicleSchema = new mongoose.Schema({
    name: String, model: String, plate: { type: String, unique: true },
    type: String, capacity: Number, odometer: Number,
    status: { type: String, default: 'Available' },
    region: String, acquiCost: Number,
}, { timestamps: true });

const DriverSchema = new mongoose.Schema({
    name: String, license: String, licenseClass: String,
    expiry: String, status: { type: String, default: 'Off Duty' },
    safetyScore: Number, tripsCompleted: { type: Number, default: 0 },
    tripsCancelled: { type: Number, default: 0 },
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
}, { timestamps: true });

const TripSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    origin: String, destination: String,
    cargoWeight: Number, cargoDesc: String,
    status: { type: String, default: 'Draft' },
    revenue: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    createdAt: String, dispatchedAt: { type: String, default: null },
    completedAt: { type: String, default: null },
    odometerEnd: { type: Number, default: null },
});

const MaintenanceSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    type: String, cost: Number, date: String, notes: String,
    status: { type: String, default: 'In Progress' },
}, { timestamps: true });

const FuelSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    liters: Number, costPerLiter: Number, totalCost: Number,
    date: String, odometer: Number, kmDriven: Number,
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true }, passwordHash: String, role: String,
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', VehicleSchema);
const Driver = mongoose.model('Driver', DriverSchema);
const Trip = mongoose.model('Trip', TripSchema);
const Maintenance = mongoose.model('Maintenance', MaintenanceSchema);
const Fuel = mongoose.model('Fuel', FuelSchema);
const User = mongoose.model('User', UserSchema);

// ─── Auth Middleware ───────────────────────────────────────────────────────────
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch { res.status(401).json({ error: 'Invalid token' }); }
};

// ─── Auth Routes ───────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            // Auto-register on first login
            const passwordHash = await bcrypt.hash(password, 10);
            user = await User.create({ email, passwordHash, role });
            await seedData(); // seed if first user ever
        } else {
            const valid = await bcrypt.compare(password, user.passwordHash);
            if (!valid) return res.status(401).json({ error: 'Invalid password' });
            // Update role on login
            user.role = role; await user.save();
        }
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: email.split('@')[0] } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/me', auth, async (req, res) => {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user._id, email: user.email, role: user.role, name: user.email.split('@')[0] });
});

// ─── Vehicles Routes ──────────────────────────────────────────────────────────
app.get('/api/vehicles', auth, async (_, res) => res.json(await Vehicle.find().sort({ createdAt: -1 })));

app.post('/api/vehicles', auth, async (req, res) => {
    try { res.status(201).json(await Vehicle.create(req.body)); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/vehicles/:id', auth, async (req, res) => {
    try { res.json(await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/vehicles/:id', auth, async (req, res) => {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// ─── Drivers Routes ───────────────────────────────────────────────────────────
app.get('/api/drivers', auth, async (_, res) => res.json(await Driver.find().sort({ createdAt: -1 })));

app.post('/api/drivers', auth, async (req, res) => {
    try { res.status(201).json(await Driver.create(req.body)); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/drivers/:id', auth, async (req, res) => {
    try { res.json(await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/drivers/:id', auth, async (req, res) => {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// ─── Trips Routes ─────────────────────────────────────────────────────────────
app.get('/api/trips', auth, async (_, res) => res.json(await Trip.find().sort({ _id: -1 })));

app.post('/api/trips', auth, async (req, res) => {
    try {
        const fmt = () => new Date().toISOString().split('T')[0];
        const trip = await Trip.create({ ...req.body, createdAt: fmt() });
        if (req.body.vehicleId) await Vehicle.findByIdAndUpdate(req.body.vehicleId, { status: 'On Trip' });
        if (req.body.driverId) await Driver.findByIdAndUpdate(req.body.driverId, { status: 'On Duty', assignedVehicle: req.body.vehicleId });
        res.status(201).json(trip);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/trips/:id/status', auth, async (req, res) => {
    try {
        const { status, odometerEnd } = req.body;
        const fmt = () => new Date().toISOString().split('T')[0];
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ error: 'Trip not found' });

        const updates = { status };
        if (status === 'Dispatched') updates.dispatchedAt = fmt();
        if (status === 'Completed' || status === 'Cancelled') {
            updates.completedAt = fmt();
            if (odometerEnd) updates.odometerEnd = odometerEnd;
        }
        const updated = await Trip.findByIdAndUpdate(req.params.id, updates, { new: true });

        if (status === 'Dispatched') {
            if (trip.vehicleId) await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'On Trip' });
            if (trip.driverId) await Driver.findByIdAndUpdate(trip.driverId, { status: 'On Duty', assignedVehicle: trip.vehicleId });
        }
        if (status === 'Completed' || status === 'Cancelled') {
            if (trip.vehicleId) {
                const vUpdates = { status: 'Available' };
                if (odometerEnd) vUpdates.odometer = odometerEnd;
                await Vehicle.findByIdAndUpdate(trip.vehicleId, vUpdates);
            }
            if (trip.driverId) {
                const driver = await Driver.findById(trip.driverId);
                await Driver.findByIdAndUpdate(trip.driverId, {
                    status: 'Off Duty', assignedVehicle: null,
                    tripsCompleted: (driver?.tripsCompleted || 0) + (status === 'Completed' ? 1 : 0),
                    tripsCancelled: (driver?.tripsCancelled || 0) + (status === 'Cancelled' ? 1 : 0),
                });
            }
        }
        res.json(updated);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/trips/:id', auth, async (req, res) => {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// ─── Maintenance Routes ───────────────────────────────────────────────────────
app.get('/api/maintenance', auth, async (_, res) => res.json(await Maintenance.find().sort({ createdAt: -1 })));

app.post('/api/maintenance', auth, async (req, res) => {
    try {
        const log = await Maintenance.create({ ...req.body, status: 'In Progress' });
        await Vehicle.findByIdAndUpdate(req.body.vehicleId, { status: 'In Shop' });
        res.status(201).json(log);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/maintenance/:id/complete', auth, async (req, res) => {
    try {
        const log = await Maintenance.findByIdAndUpdate(req.params.id, { status: 'Completed' }, { new: true });
        const otherActive = await Maintenance.findOne({ vehicleId: log.vehicleId, status: 'In Progress', _id: { $ne: log._id } });
        if (!otherActive) await Vehicle.findByIdAndUpdate(log.vehicleId, { status: 'Available' });
        res.json(log);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/maintenance/:id', auth, async (req, res) => {
    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// ─── Fuel Routes ──────────────────────────────────────────────────────────────
app.get('/api/fuel', auth, async (_, res) => res.json(await Fuel.find().sort({ createdAt: -1 })));

app.post('/api/fuel', auth, async (req, res) => {
    try { res.status(201).json(await Fuel.create(req.body)); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/fuel/:id', auth, async (req, res) => {
    await Fuel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// ─── Seed Data ────────────────────────────────────────────────────────────────
async function seedData() {
    const count = await Vehicle.countDocuments();
    if (count > 0) return;

    const today = new Date();
    const dFA = (n) => new Date(today.getTime() + n * 86400000).toISOString().split('T')[0];
    const dAgo = (n) => new Date(today.getTime() - n * 86400000).toISOString().split('T')[0];

    const vehicles = await Vehicle.insertMany([
        { name: 'Van-01', model: 'Ford Transit', plate: 'KA-01-AB-1234', type: 'Van', capacity: 800, odometer: 42300, status: 'Available', region: 'North', acquiCost: 1200000 },
        { name: 'Truck-01', model: 'Tata LPT 1109', plate: 'MH-12-CD-5678', type: 'Truck', capacity: 5000, odometer: 98700, status: 'On Trip', region: 'West', acquiCost: 3500000 },
        { name: 'Bike-01', model: 'Royal Enfield Meteor', plate: 'DL-01-EF-9012', type: 'Bike', capacity: 50, odometer: 18900, status: 'Available', region: 'Central', acquiCost: 180000 },
        { name: 'Van-02', model: 'Mahindra Supro', plate: 'TN-09-GH-3456', type: 'Van', capacity: 600, odometer: 31200, status: 'In Shop', region: 'South', acquiCost: 900000 },
        { name: 'Truck-02', model: 'Ashok Leyland Dost', plate: 'RJ-14-IJ-7890', type: 'Truck', capacity: 3500, odometer: 67500, status: 'Available', region: 'North', acquiCost: 2800000 },
        { name: 'Van-03', model: 'Maruti Eeco Cargo', plate: 'GJ-05-KL-2345', type: 'Van', capacity: 500, odometer: 22100, status: 'Available', region: 'West', acquiCost: 650000 },
    ]);

    const drivers = await Driver.insertMany([
        { name: 'Arjun Sharma', license: 'MH-DL-20198822', licenseClass: 'LMV,HMV', expiry: dFA(180), status: 'On Duty', safetyScore: 92, tripsCompleted: 47, tripsCancelled: 2, assignedVehicle: vehicles[1]._id },
        { name: 'Priya Nair', license: 'KA-DL-20154411', licenseClass: 'LMV', expiry: dFA(25), status: 'On Duty', safetyScore: 88, tripsCompleted: 31, tripsCancelled: 1 },
        { name: 'Ravi Verma', license: 'DL-DL-20171983', licenseClass: 'LMV,HMV', expiry: dAgo(5), status: 'Off Duty', safetyScore: 75, tripsCompleted: 22, tripsCancelled: 5 },
        { name: 'Sneha Pillai', license: 'TN-DL-20193344', licenseClass: 'LMV', expiry: dFA(300), status: 'Off Duty', safetyScore: 95, tripsCompleted: 58, tripsCancelled: 0 },
        { name: 'Karan Singh', license: 'GJ-DL-20206677', licenseClass: 'LMV,HMV', expiry: dFA(120), status: 'Suspended', safetyScore: 55, tripsCompleted: 14, tripsCancelled: 8 },
    ]);

    await Trip.insertMany([
        { vehicleId: vehicles[1]._id, driverId: drivers[0]._id, origin: 'Mumbai', destination: 'Pune', cargoWeight: 3200, cargoDesc: 'Electronics', status: 'Dispatched', createdAt: dAgo(1), dispatchedAt: dAgo(1), revenue: 45000, distance: 148 },
        { vehicleId: vehicles[0]._id, driverId: drivers[1]._id, origin: 'Bangalore', destination: 'Chennai', cargoWeight: 450, cargoDesc: 'Garments', status: 'Completed', createdAt: dAgo(5), dispatchedAt: dAgo(5), completedAt: dAgo(4), revenue: 18000, distance: 347 },
        { vehicleId: vehicles[2]._id, driverId: drivers[3]._id, origin: 'Delhi', destination: 'Noida', cargoWeight: 30, cargoDesc: 'Documents', status: 'Completed', createdAt: dAgo(3), dispatchedAt: dAgo(3), completedAt: dAgo(3), revenue: 2000, distance: 47 },
        { vehicleId: vehicles[4]._id, driverId: null, origin: 'Jaipur', destination: 'Ahmedabad', cargoWeight: 2800, cargoDesc: 'Building Material', status: 'Draft', createdAt: dAgo(0), revenue: 0, distance: 0 },
    ]);

    await Maintenance.insertMany([
        { vehicleId: vehicles[3]._id, type: 'Oil Change', cost: 4500, date: dAgo(2), notes: 'Full synthetic, filter replaced', status: 'In Progress' },
        { vehicleId: vehicles[0]._id, type: 'Tyre Rotation', cost: 1200, date: dAgo(10), notes: 'All 4 tyres rotated', status: 'Completed' },
        { vehicleId: vehicles[1]._id, type: 'Brake Inspection', cost: 2800, date: dAgo(20), notes: 'Brake pads replaced front axle', status: 'Completed' },
    ]);

    await Fuel.insertMany([
        { vehicleId: vehicles[0]._id, liters: 45, costPerLiter: 102.5, totalCost: 4612.5, date: dAgo(4), odometer: 42550, kmDriven: 347 },
        { vehicleId: vehicles[1]._id, liters: 120, costPerLiter: 98.0, totalCost: 11760, date: dAgo(1), odometer: 98700, kmDriven: 820 },
        { vehicleId: vehicles[2]._id, liters: 10, costPerLiter: 102.5, totalCost: 1025, date: dAgo(3), odometer: 18940, kmDriven: 47 },
        { vehicleId: vehicles[4]._id, liters: 80, costPerLiter: 98.0, totalCost: 7840, date: dAgo(7), odometer: 67500, kmDriven: 500 },
        { vehicleId: vehicles[0]._id, liters: 38, costPerLiter: 102.5, totalCost: 3895, date: dAgo(12), odometer: 42203, kmDriven: 280 },
        { vehicleId: vehicles[3]._id, liters: 55, costPerLiter: 98.0, totalCost: 5390, date: dAgo(15), odometer: 31100, kmDriven: 320 },
    ]);

    console.log('✅ Demo data seeded to MongoDB');
}

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 FleetFlow API running on http://localhost:${PORT}`));
