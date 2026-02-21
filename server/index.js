import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes, Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ─── PostgreSQL Connection (Sequelize) ────────────────────────────────────────
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
        logging: false,
    })
    : new Sequelize(
        process.env.PG_DATABASE || 'fleetflow',
        process.env.PG_USER || 'postgres',
        process.env.PG_PASSWORD || '',
        {
            host: process.env.PG_HOST || 'localhost',
            port: parseInt(process.env.PG_PORT || '5432'),
            dialect: 'postgres',
            logging: false,
        }
    );

// ─── Models ───────────────────────────────────────────────────────────────────
const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: 'Manager' },
});

const Vehicle = sequelize.define('Vehicle', {
    name: { type: DataTypes.STRING, allowNull: false },
    model: { type: DataTypes.STRING },
    plate: { type: DataTypes.STRING, unique: true },
    type: { type: DataTypes.STRING },
    capacity: { type: DataTypes.FLOAT },
    odometer: { type: DataTypes.FLOAT, defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: 'Available' },
    region: { type: DataTypes.STRING },
    acquiCost: { type: DataTypes.FLOAT, defaultValue: 0 },
});

const Driver = sequelize.define('Driver', {
    name: { type: DataTypes.STRING, allowNull: false },
    license: { type: DataTypes.STRING },
    licenseClass: { type: DataTypes.STRING },
    expiry: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'Off Duty' },
    safetyScore: { type: DataTypes.FLOAT, defaultValue: 80 },
    tripsCompleted: { type: DataTypes.INTEGER, defaultValue: 0 },
    tripsCancelled: { type: DataTypes.INTEGER, defaultValue: 0 },
    assignedVehicleId: { type: DataTypes.INTEGER, allowNull: true },
});

const Trip = sequelize.define('Trip', {
    vehicleId: { type: DataTypes.INTEGER, allowNull: true },
    driverId: { type: DataTypes.INTEGER, allowNull: true },
    origin: { type: DataTypes.STRING },
    destination: { type: DataTypes.STRING },
    cargoWeight: { type: DataTypes.FLOAT },
    cargoDesc: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'Draft' },
    revenue: { type: DataTypes.FLOAT, defaultValue: 0 },
    distance: { type: DataTypes.FLOAT, defaultValue: 0 },
    tripDate: { type: DataTypes.STRING },
    dispatchedAt: { type: DataTypes.STRING, allowNull: true },
    completedAt: { type: DataTypes.STRING, allowNull: true },
    odometerEnd: { type: DataTypes.FLOAT, allowNull: true },
});

const MaintenanceLog = sequelize.define('MaintenanceLog', {
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING },
    cost: { type: DataTypes.FLOAT },
    date: { type: DataTypes.STRING },
    notes: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING, defaultValue: 'In Progress' },
});

const FuelLog = sequelize.define('FuelLog', {
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    liters: { type: DataTypes.FLOAT },
    costPerLiter: { type: DataTypes.FLOAT },
    totalCost: { type: DataTypes.FLOAT },
    date: { type: DataTypes.STRING },
    odometer: { type: DataTypes.FLOAT },
    kmDriven: { type: DataTypes.FLOAT },
});

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
    catch { res.status(401).json({ error: 'Invalid token' }); }
};

const signToken = (user) =>
    jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userPayload = (user) => ({
    id: user.id, email: user.email, role: user.role, name: user.name || user.email.split('@')[0],
});

// ─── SIGN IN ──────────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: 'No account found. Please sign up first.' });
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Incorrect password.' });
        await user.update({ role });
        res.json({ token: signToken(user), user: userPayload(user) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── SIGN UP ──────────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, role } = req.body;
    try {
        if (!email || !password || password.length < 6)
            return res.status(400).json({ error: 'Email and password (min 6 chars) required.' });
        const exists = await User.findOne({ where: { email } });
        if (exists) return res.status(409).json({ error: 'Email already registered. Please sign in.' });
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash, name: name || email.split('@')[0], role });
        await seedData();
        res.status(201).json({ token: signToken(user), user: userPayload(user) });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/me', auth, async (req, res) => {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['passwordHash'] } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(userPayload(user));
});

// ─── Vehicles ─────────────────────────────────────────────────────────────────
app.get('/api/vehicles', auth, async (_, res) => {
    res.json(await Vehicle.findAll({ order: [['createdAt', 'DESC']] }));
});
app.post('/api/vehicles', auth, async (req, res) => {
    try { res.status(201).json(await Vehicle.create(req.body)); }
    catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/vehicles/:id', auth, async (req, res) => {
    try {
        const v = await Vehicle.findByPk(req.params.id);
        if (!v) return res.status(404).json({ error: 'Not found' });
        res.json(await v.update(req.body));
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/vehicles/:id', auth, async (req, res) => {
    await Vehicle.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
});

// ─── Drivers ──────────────────────────────────────────────────────────────────
app.get('/api/drivers', auth, async (_, res) => {
    res.json(await Driver.findAll({ order: [['createdAt', 'DESC']] }));
});
app.post('/api/drivers', auth, async (req, res) => {
    try { res.status(201).json(await Driver.create(req.body)); }
    catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/drivers/:id', auth, async (req, res) => {
    try {
        const d = await Driver.findByPk(req.params.id);
        if (!d) return res.status(404).json({ error: 'Not found' });
        res.json(await d.update(req.body));
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/drivers/:id', auth, async (req, res) => {
    await Driver.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
});

// ─── Trips ────────────────────────────────────────────────────────────────────
app.get('/api/trips', auth, async (_, res) => {
    res.json(await Trip.findAll({ order: [['id', 'DESC']] }));
});
app.post('/api/trips', auth, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const trip = await Trip.create({ ...req.body, tripDate: today });
        if (req.body.vehicleId) await Vehicle.update({ status: 'On Trip' }, { where: { id: req.body.vehicleId } });
        if (req.body.driverId) await Driver.update({ status: 'On Duty', assignedVehicleId: req.body.vehicleId }, { where: { id: req.body.driverId } });
        res.status(201).json(trip);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/trips/:id/status', auth, async (req, res) => {
    try {
        const { status, odometerEnd } = req.body;
        const today = new Date().toISOString().split('T')[0];
        const trip = await Trip.findByPk(req.params.id);
        if (!trip) return res.status(404).json({ error: 'Not found' });

        const updates = { status };
        if (status === 'Dispatched') updates.dispatchedAt = today;
        if (status === 'Completed' || status === 'Cancelled') {
            updates.completedAt = today;
            if (odometerEnd) updates.odometerEnd = odometerEnd;
        }
        await trip.update(updates);

        if (status === 'Dispatched') {
            if (trip.vehicleId) await Vehicle.update({ status: 'On Trip' }, { where: { id: trip.vehicleId } });
            if (trip.driverId) await Driver.update({ status: 'On Duty', assignedVehicleId: trip.vehicleId }, { where: { id: trip.driverId } });
        }
        if (status === 'Completed' || status === 'Cancelled') {
            if (trip.vehicleId) {
                const vUp = { status: 'Available' };
                if (odometerEnd) vUp.odometer = odometerEnd;
                await Vehicle.update(vUp, { where: { id: trip.vehicleId } });
            }
            if (trip.driverId) {
                const driver = await Driver.findByPk(trip.driverId);
                if (driver) await driver.update({
                    status: 'Off Duty', assignedVehicleId: null,
                    tripsCompleted: driver.tripsCompleted + (status === 'Completed' ? 1 : 0),
                    tripsCancelled: driver.tripsCancelled + (status === 'Cancelled' ? 1 : 0),
                });
            }
        }
        res.json(trip);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/trips/:id', auth, async (req, res) => {
    await Trip.destroy({ where: { id: req.params.id } }); res.json({ success: true });
});

// ─── Maintenance ──────────────────────────────────────────────────────────────
app.get('/api/maintenance', auth, async (_, res) => {
    res.json(await MaintenanceLog.findAll({ order: [['createdAt', 'DESC']] }));
});
app.post('/api/maintenance', auth, async (req, res) => {
    try {
        const log = await MaintenanceLog.create({ ...req.body, status: 'In Progress' });
        await Vehicle.update({ status: 'In Shop' }, { where: { id: req.body.vehicleId } });
        res.status(201).json(log);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/maintenance/:id/complete', auth, async (req, res) => {
    try {
        const log = await MaintenanceLog.findByPk(req.params.id);
        if (!log) return res.status(404).json({ error: 'Not found' });
        await log.update({ status: 'Completed' });
        const otherActive = await MaintenanceLog.findOne({
            where: { vehicleId: log.vehicleId, status: 'In Progress', id: { [Op.ne]: log.id } },
        });
        if (!otherActive) await Vehicle.update({ status: 'Available' }, { where: { id: log.vehicleId } });
        res.json(log);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/maintenance/:id', auth, async (req, res) => {
    await MaintenanceLog.destroy({ where: { id: req.params.id } }); res.json({ success: true });
});

// ─── Fuel ─────────────────────────────────────────────────────────────────────
app.get('/api/fuel', auth, async (_, res) => {
    res.json(await FuelLog.findAll({ order: [['createdAt', 'DESC']] }));
});
app.post('/api/fuel', auth, async (req, res) => {
    try { res.status(201).json(await FuelLog.create(req.body)); }
    catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/fuel/:id', auth, async (req, res) => {
    await FuelLog.destroy({ where: { id: req.params.id } }); res.json({ success: true });
});

// ─── Seed Demo Data ───────────────────────────────────────────────────────────
async function seedData() {
    const count = await Vehicle.count();
    if (count > 0) return;

    const dFA = (n) => new Date(Date.now() + n * 86400000).toISOString().split('T')[0];
    const dAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().split('T')[0];

    const vehicles = await Vehicle.bulkCreate([
        { name: 'Van-01', model: 'Ford Transit', plate: 'KA-01-AB-1234', type: 'Van', capacity: 800, odometer: 42300, status: 'Available', region: 'North', acquiCost: 1200000 },
        { name: 'Truck-01', model: 'Tata LPT 1109', plate: 'MH-12-CD-5678', type: 'Truck', capacity: 5000, odometer: 98700, status: 'On Trip', region: 'West', acquiCost: 3500000 },
        { name: 'Bike-01', model: 'Royal Enfield Meteor', plate: 'DL-01-EF-9012', type: 'Bike', capacity: 50, odometer: 18900, status: 'Available', region: 'Central', acquiCost: 180000 },
        { name: 'Van-02', model: 'Mahindra Supro', plate: 'TN-09-GH-3456', type: 'Van', capacity: 600, odometer: 31200, status: 'In Shop', region: 'South', acquiCost: 900000 },
        { name: 'Truck-02', model: 'Ashok Leyland Dost', plate: 'RJ-14-IJ-7890', type: 'Truck', capacity: 3500, odometer: 67500, status: 'Available', region: 'North', acquiCost: 2800000 },
        { name: 'Van-03', model: 'Maruti Eeco Cargo', plate: 'GJ-05-KL-2345', type: 'Van', capacity: 500, odometer: 22100, status: 'Available', region: 'West', acquiCost: 650000 },
    ], { returning: true });

    const drivers = await Driver.bulkCreate([
        { name: 'Arjun Sharma', license: 'MH-DL-20198822', licenseClass: 'LMV,HMV', expiry: dFA(180), status: 'On Duty', safetyScore: 92, tripsCompleted: 47, tripsCancelled: 2, assignedVehicleId: vehicles[1].id },
        { name: 'Priya Nair', license: 'KA-DL-20154411', licenseClass: 'LMV', expiry: dFA(25), status: 'On Duty', safetyScore: 88, tripsCompleted: 31, tripsCancelled: 1 },
        { name: 'Ravi Verma', license: 'DL-DL-20171983', licenseClass: 'LMV,HMV', expiry: dAgo(5), status: 'Off Duty', safetyScore: 75, tripsCompleted: 22, tripsCancelled: 5 },
        { name: 'Sneha Pillai', license: 'TN-DL-20193344', licenseClass: 'LMV', expiry: dFA(300), status: 'Off Duty', safetyScore: 95, tripsCompleted: 58, tripsCancelled: 0 },
        { name: 'Karan Singh', license: 'GJ-DL-20206677', licenseClass: 'LMV,HMV', expiry: dFA(120), status: 'Suspended', safetyScore: 55, tripsCompleted: 14, tripsCancelled: 8 },
    ], { returning: true });

    await Trip.bulkCreate([
        { vehicleId: vehicles[1].id, driverId: drivers[0].id, origin: 'Mumbai', destination: 'Pune', cargoWeight: 3200, cargoDesc: 'Electronics', status: 'Dispatched', tripDate: dAgo(1), dispatchedAt: dAgo(1), revenue: 45000, distance: 148 },
        { vehicleId: vehicles[0].id, driverId: drivers[1].id, origin: 'Bangalore', destination: 'Chennai', cargoWeight: 450, cargoDesc: 'Garments', status: 'Completed', tripDate: dAgo(5), dispatchedAt: dAgo(5), completedAt: dAgo(4), revenue: 18000, distance: 347 },
        { vehicleId: vehicles[2].id, driverId: drivers[3].id, origin: 'Delhi', destination: 'Noida', cargoWeight: 30, cargoDesc: 'Documents', status: 'Completed', tripDate: dAgo(3), dispatchedAt: dAgo(3), completedAt: dAgo(3), revenue: 2000, distance: 47 },
        { vehicleId: vehicles[4].id, driverId: null, origin: 'Jaipur', destination: 'Ahmedabad', cargoWeight: 2800, cargoDesc: 'Building Material', status: 'Draft', tripDate: dAgo(0), revenue: 0, distance: 0 },
    ]);

    await MaintenanceLog.bulkCreate([
        { vehicleId: vehicles[3].id, type: 'Oil Change', cost: 4500, date: dAgo(2), notes: 'Full synthetic, filter replaced', status: 'In Progress' },
        { vehicleId: vehicles[0].id, type: 'Tyre Rotation', cost: 1200, date: dAgo(10), notes: 'All 4 tyres rotated', status: 'Completed' },
        { vehicleId: vehicles[1].id, type: 'Brake Inspection', cost: 2800, date: dAgo(20), notes: 'Brake pads replaced front axle', status: 'Completed' },
    ]);

    await FuelLog.bulkCreate([
        { vehicleId: vehicles[0].id, liters: 45, costPerLiter: 102.5, totalCost: 4612.5, date: dAgo(4), odometer: 42550, kmDriven: 347 },
        { vehicleId: vehicles[1].id, liters: 120, costPerLiter: 98.0, totalCost: 11760, date: dAgo(1), odometer: 98700, kmDriven: 820 },
        { vehicleId: vehicles[2].id, liters: 10, costPerLiter: 102.5, totalCost: 1025, date: dAgo(3), odometer: 18940, kmDriven: 47 },
        { vehicleId: vehicles[4].id, liters: 80, costPerLiter: 98.0, totalCost: 7840, date: dAgo(7), odometer: 67500, kmDriven: 500 },
        { vehicleId: vehicles[0].id, liters: 38, costPerLiter: 102.5, totalCost: 3895, date: dAgo(12), odometer: 42203, kmDriven: 280 },
        { vehicleId: vehicles[3].id, liters: 55, costPerLiter: 98.0, totalCost: 5390, date: dAgo(15), odometer: 31100, kmDriven: 320 },
    ]);

    console.log('✅ Demo data seeded to PostgreSQL');
}

// ─── Sync DB & Start ──────────────────────────────────────────────────────────
sequelize.authenticate()
    .then(() => {
        console.log('✅ PostgreSQL connected');
        return sequelize.sync({ alter: true }); // creates/alters tables automatically
    })
    .then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 FleetFlow API on http://localhost:${PORT} (PostgreSQL)`));
    })
    .catch(err => {
        console.error('❌ PostgreSQL connection failed:', err.message);
        process.exit(1);
    });
