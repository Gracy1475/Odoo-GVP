import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc,
  setDoc, getDocs, writeBatch, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

// ─── Helpers ───────────────────────────────────────────────────────────────
const today = new Date();
const fmt = (d) => (d instanceof Date ? d : new Date(d)).toISOString().split('T')[0];
const daysFromNow = (n) => fmt(new Date(today.getTime() + n * 86400000));
const daysAgo = (n) => fmt(new Date(today.getTime() - n * 86400000));

export const isLicenseExpired = (d) => d.expiry < fmt(new Date());
export const isLicenseSoonExpiring = (d) => {
  const days = Math.ceil((new Date(d.expiry) - new Date()) / 86400000);
  return days > 0 && days <= 30;
};
export function getVehicleTotalCost(vehicleId, fuelLogs, maintenanceLogs) {
  const fuel = fuelLogs.filter(f => f.vehicleId === vehicleId).reduce((s, f) => s + (f.totalCost || 0), 0);
  const maint = maintenanceLogs.filter(m => m.vehicleId === vehicleId).reduce((s, m) => s + (m.cost || 0), 0);
  return { fuel, maint, total: fuel + maint };
}

// ─── Seed data (written only if Firestore collections are empty) ────────────
const SEED = {
  vehicles: [
    { name: 'Van-01', model: 'Ford Transit', plate: 'KA-01-AB-1234', type: 'Van', capacity: 800, odometer: 42300, status: 'Available', region: 'North', acquiCost: 1200000 },
    { name: 'Truck-01', model: 'Tata LPT 1109', plate: 'MH-12-CD-5678', type: 'Truck', capacity: 5000, odometer: 98700, status: 'On Trip', region: 'West', acquiCost: 3500000 },
    { name: 'Bike-01', model: 'Royal Enfield Meteor', plate: 'DL-01-EF-9012', type: 'Bike', capacity: 50, odometer: 18900, status: 'Available', region: 'Central', acquiCost: 180000 },
    { name: 'Van-02', model: 'Mahindra Supro', plate: 'TN-09-GH-3456', type: 'Van', capacity: 600, odometer: 31200, status: 'In Shop', region: 'South', acquiCost: 900000 },
    { name: 'Truck-02', model: 'Ashok Leyland Dost', plate: 'RJ-14-IJ-7890', type: 'Truck', capacity: 3500, odometer: 67500, status: 'Available', region: 'North', acquiCost: 2800000 },
    { name: 'Van-03', model: 'Maruti Eeco Cargo', plate: 'GJ-05-KL-2345', type: 'Van', capacity: 500, odometer: 22100, status: 'Available', region: 'West', acquiCost: 650000 },
  ],
  drivers: [
    { name: 'Arjun Sharma', license: 'MH-DL-20198822', licenseClass: 'LMV,HMV', expiry: daysFromNow(180), status: 'On Duty', safetyScore: 92, tripsCompleted: 47, tripsCancelled: 2, assignedVehicle: null },
    { name: 'Priya Nair', license: 'KA-DL-20154411', licenseClass: 'LMV', expiry: daysFromNow(25), status: 'On Duty', safetyScore: 88, tripsCompleted: 31, tripsCancelled: 1, assignedVehicle: null },
    { name: 'Ravi Verma', license: 'DL-DL-20171983', licenseClass: 'LMV,HMV', expiry: daysAgo(5), status: 'Off Duty', safetyScore: 75, tripsCompleted: 22, tripsCancelled: 5, assignedVehicle: null },
    { name: 'Sneha Pillai', license: 'TN-DL-20193344', licenseClass: 'LMV', expiry: daysFromNow(300), status: 'Off Duty', safetyScore: 95, tripsCompleted: 58, tripsCancelled: 0, assignedVehicle: null },
    { name: 'Karan Singh', license: 'GJ-DL-20206677', licenseClass: 'LMV,HMV', expiry: daysFromNow(120), status: 'Suspended', safetyScore: 55, tripsCompleted: 14, tripsCancelled: 8, assignedVehicle: null },
  ],
  trips: [
    { vehicleId: null, driverId: null, origin: 'Mumbai', destination: 'Pune', cargoWeight: 3200, cargoDesc: 'Electronics', status: 'Dispatched', createdAt: daysAgo(1), dispatchedAt: daysAgo(1), completedAt: null, odometerEnd: null, revenue: 45000, distance: 148 },
    { vehicleId: null, driverId: null, origin: 'Bangalore', destination: 'Chennai', cargoWeight: 450, cargoDesc: 'Garments', status: 'Completed', createdAt: daysAgo(5), dispatchedAt: daysAgo(5), completedAt: daysAgo(4), odometerEnd: null, revenue: 18000, distance: 347 },
    { vehicleId: null, driverId: null, origin: 'Delhi', destination: 'Noida', cargoWeight: 30, cargoDesc: 'Documents', status: 'Completed', createdAt: daysAgo(3), dispatchedAt: daysAgo(3), completedAt: daysAgo(3), odometerEnd: null, revenue: 2000, distance: 47 },
    { vehicleId: null, driverId: null, origin: 'Jaipur', destination: 'Ahmedabad', cargoWeight: 2800, cargoDesc: 'Building Material', status: 'Draft', createdAt: daysAgo(0), dispatchedAt: null, completedAt: null, odometerEnd: null, revenue: 0, distance: 0 },
  ],
  maintenanceLogs: [
    { vehicleId: null, type: 'Oil Change', cost: 4500, date: daysAgo(2), notes: 'Full synthetic, filter replaced', status: 'In Progress' },
    { vehicleId: null, type: 'Tyre Rotation', cost: 1200, date: daysAgo(10), notes: 'All 4 tyres rotated', status: 'Completed' },
    { vehicleId: null, type: 'Brake Inspection', cost: 2800, date: daysAgo(20), notes: 'Brake pads replaced front axle', status: 'Completed' },
  ],
  fuelLogs: [
    { vehicleId: null, liters: 45, costPerLiter: 102.5, totalCost: 4612.5, date: daysAgo(4), odometer: 42550, kmDriven: 347 },
    { vehicleId: null, liters: 120, costPerLiter: 98.0, totalCost: 11760, date: daysAgo(1), odometer: 98700, kmDriven: 820 },
    { vehicleId: null, liters: 10, costPerLiter: 102.5, totalCost: 1025, date: daysAgo(3), odometer: 18940, kmDriven: 47 },
    { vehicleId: null, liters: 80, costPerLiter: 98.0, totalCost: 7840, date: daysAgo(7), odometer: 67500, kmDriven: 500 },
    { vehicleId: null, liters: 38, costPerLiter: 102.5, totalCost: 3895, date: daysAgo(12), odometer: 42203, kmDriven: 280 },
    { vehicleId: null, liters: 55, costPerLiter: 98.0, totalCost: 5390, date: daysAgo(15), odometer: 31100, kmDriven: 320 },
  ],
};

// ─── Seed Firestore once ────────────────────────────────────────────────────
async function seedIfEmpty() {
  const colls = ['vehicles', 'drivers', 'trips', 'maintenanceLogs', 'fuelLogs'];
  for (const coll of colls) {
    const snap = await getDocs(collection(db, coll));
    if (!snap.empty) continue;

    const batch = writeBatch(db);
    const refs = {};

    // First pass: create vehicles so we can get their IDs for trips/logs
    if (coll === 'vehicles') {
      for (const item of SEED.vehicles) {
        const ref = doc(collection(db, 'vehicles'));
        refs[item.name] = ref.id;
        batch.set(ref, { ...item, createdAt: serverTimestamp() });
      }
    }
    await batch.commit();
  }

  // Re-seed with cross-collection IDs
  const vSnap = await getDocs(collection(db, 'vehicles'));
  const vMap = {}; // name → id
  vSnap.forEach(d => { vMap[d.data().name] = d.id; });

  const dSnap = await getDocs(collection(db, 'drivers'));
  if (dSnap.empty) {
    const b = writeBatch(db);
    SEED.drivers.forEach(item => b.set(doc(collection(db, 'drivers')), { ...item, createdAt: serverTimestamp() }));
    await b.commit();
  }

  const dSnap2 = await getDocs(collection(db, 'drivers'));
  const dMap = {};
  dSnap2.forEach(d => { dMap[d.data().name] = d.id; });

  // Trips
  const tSnap = await getDocs(collection(db, 'trips'));
  if (tSnap.empty) {
    const b = writeBatch(db);
    const vIds = Object.values(vMap);
    const dIds = Object.values(dMap);
    SEED.trips.forEach((item, i) => {
      b.set(doc(collection(db, 'trips')), {
        ...item,
        vehicleId: vIds[i % vIds.length] || null,
        driverId: i === 0 ? dIds[0] : null,
        createdAt: serverTimestamp(),
      });
    });
    await b.commit();
  }

  // Maintenance
  const mSnap = await getDocs(collection(db, 'maintenanceLogs'));
  if (mSnap.empty) {
    const b = writeBatch(db);
    const vIds = Object.values(vMap);
    SEED.maintenanceLogs.forEach((item, i) =>
      b.set(doc(collection(db, 'maintenanceLogs')), { ...item, vehicleId: vIds[i % vIds.length], createdAt: serverTimestamp() })
    );
    await b.commit();
  }

  // Fuel
  const fSnap = await getDocs(collection(db, 'fuelLogs'));
  if (fSnap.empty) {
    const b = writeBatch(db);
    const vIds = Object.values(vMap);
    SEED.fuelLogs.forEach((item, i) =>
      b.set(doc(collection(db, 'fuelLogs')), { ...item, vehicleId: vIds[i % vIds.length], createdAt: serverTimestamp() })
    );
    await b.commit();
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenanceLogs, setMaintLogs] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  // Seed then listen
  useEffect(() => {
    seedIfEmpty()
      .then(() => setSeeded(true))
      .catch(err => {
        console.error('Seed error:', err);
        setSeeded(true); // still try to listen
      });
  }, []);

  useEffect(() => {
    if (!seeded) return;
    const unsubs = [
      onSnapshot(collection(db, 'vehicles'), s => { setVehicles(s.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); }),
      onSnapshot(collection(db, 'drivers'), s => setDrivers(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, 'trips'), s => setTrips(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, 'maintenanceLogs'), s => setMaintLogs(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, 'fuelLogs'), s => setFuelLogs(s.docs.map(d => ({ id: d.id, ...d.data() })))),
    ];
    return () => unsubs.forEach(u => u());
  }, [seeded]);

  // ── VEHICLES ──────────────────────────────────────────────────────────────
  const addVehicle = useCallback(async (data) => {
    await addDoc(collection(db, 'vehicles'), { ...data, status: 'Available', createdAt: serverTimestamp() });
  }, []);

  const updateVehicle = useCallback(async (id, data) => {
    await updateDoc(doc(db, 'vehicles', id), data);
  }, []);

  const deleteVehicle = useCallback(async (id) => {
    await deleteDoc(doc(db, 'vehicles', id));
  }, []);

  const setVehicleStatus = useCallback(async (vehicleId, status) => {
    await updateDoc(doc(db, 'vehicles', vehicleId), { status });
  }, []);

  // ── DRIVERS ───────────────────────────────────────────────────────────────
  const addDriver = useCallback(async (data) => {
    await addDoc(collection(db, 'drivers'), { ...data, tripsCompleted: 0, tripsCancelled: 0, assignedVehicle: null, createdAt: serverTimestamp() });
  }, []);

  const updateDriver = useCallback(async (id, data) => {
    await updateDoc(doc(db, 'drivers', id), data);
  }, []);

  const deleteDriver = useCallback(async (id) => {
    await deleteDoc(doc(db, 'drivers', id));
  }, []);

  const setDriverStatus = useCallback(async (driverId, status) => {
    await updateDoc(doc(db, 'drivers', driverId), { status });
  }, []);

  // ── TRIPS ─────────────────────────────────────────────────────────────────
  const addTrip = useCallback(async (data) => {
    const newTrip = { ...data, status: 'Draft', createdAt: fmt(new Date()), dispatchedAt: null, completedAt: null, odometerEnd: null };
    await addDoc(collection(db, 'trips'), newTrip);
    // Update vehicle & driver status
    if (data.vehicleId) await updateDoc(doc(db, 'vehicles', data.vehicleId), { status: 'On Trip' });
    if (data.driverId) await updateDoc(doc(db, 'drivers', data.driverId), { status: 'On Duty', assignedVehicle: data.vehicleId });
  }, []);

  const updateTripStatus = useCallback(async (tripId, status, odometerEnd) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const updates = { status };
    if (status === 'Dispatched') updates.dispatchedAt = fmt(new Date());
    if (status === 'Completed' || status === 'Cancelled') {
      updates.completedAt = fmt(new Date());
      if (odometerEnd) updates.odometerEnd = odometerEnd;
    }

    await updateDoc(doc(db, 'trips', tripId), updates);

    if (status === 'Dispatched' && trip.vehicleId) {
      await updateDoc(doc(db, 'vehicles', trip.vehicleId), { status: 'On Trip' });
      if (trip.driverId) await updateDoc(doc(db, 'drivers', trip.driverId), { status: 'On Duty', assignedVehicle: trip.vehicleId });
    }
    if (status === 'Completed' || status === 'Cancelled') {
      if (trip.vehicleId) {
        const vUpdates = { status: 'Available' };
        if (odometerEnd) vUpdates.odometer = odometerEnd;
        await updateDoc(doc(db, 'vehicles', trip.vehicleId), vUpdates);
      }
      if (trip.driverId) {
        const driver = drivers.find(d => d.id === trip.driverId);
        await updateDoc(doc(db, 'drivers', trip.driverId), {
          status: 'Off Duty',
          assignedVehicle: null,
          tripsCompleted: (driver?.tripsCompleted || 0) + (status === 'Completed' ? 1 : 0),
          tripsCancelled: (driver?.tripsCancelled || 0) + (status === 'Cancelled' ? 1 : 0),
        });
      }
    }
  }, [trips, drivers]);

  const deleteTrip = useCallback(async (id) => {
    await deleteDoc(doc(db, 'trips', id));
  }, []);

  // ── MAINTENANCE ───────────────────────────────────────────────────────────
  const addMaintenance = useCallback(async (data) => {
    await addDoc(collection(db, 'maintenanceLogs'), { ...data, status: 'In Progress', createdAt: serverTimestamp() });
    await updateDoc(doc(db, 'vehicles', data.vehicleId), { status: 'In Shop' });
  }, []);

  const completeMaintenance = useCallback(async (logId) => {
    const log = maintenanceLogs.find(m => m.id === logId);
    if (!log) return;
    await updateDoc(doc(db, 'maintenanceLogs', logId), { status: 'Completed' });
    const otherActive = maintenanceLogs.some(m => m.id !== logId && m.vehicleId === log.vehicleId && m.status === 'In Progress');
    if (!otherActive) await updateDoc(doc(db, 'vehicles', log.vehicleId), { status: 'Available' });
  }, [maintenanceLogs]);

  const deleteMaintenance = useCallback(async (id) => {
    await deleteDoc(doc(db, 'maintenanceLogs', id));
  }, []);

  // ── FUEL ──────────────────────────────────────────────────────────────────
  const addFuel = useCallback(async (data) => {
    await addDoc(collection(db, 'fuelLogs'), { ...data, createdAt: serverTimestamp() });
  }, []);

  const deleteFuel = useCallback(async (id) => {
    await deleteDoc(doc(db, 'fuelLogs', id));
  }, []);

  const state = { vehicles, drivers, trips, maintenanceLogs, fuelLogs, loading };
  const actions = {
    addVehicle, updateVehicle, deleteVehicle, setVehicleStatus,
    addDriver, updateDriver, deleteDriver, setDriverStatus,
    addTrip, updateTripStatus, deleteTrip,
    addMaintenance, completeMaintenance, deleteMaintenance,
    addFuel, deleteFuel,
  };

  return <AppContext.Provider value={{ state, ...actions }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
