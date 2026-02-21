import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  apiGetVehicles, apiAddVehicle, apiUpdateVehicle, apiDeleteVehicle,
  apiGetDrivers, apiAddDriver, apiUpdateDriver, apiDeleteDriver,
  apiGetTrips, apiAddTrip, apiUpdateTripStatus, apiDeleteTrip,
  apiGetMaintenance, apiAddMaintenance, apiCompleteMaintenance, apiDeleteMaintenance,
  apiGetFuel, apiAddFuel, apiDeleteFuel,
} from '../api';

// ─── Helpers (exported for use in pages) ────────────────────────────────────
export const isLicenseExpired = (d) => d.expiry < new Date().toISOString().split('T')[0];
export const isLicenseSoonExpiring = (d) => {
  const days = Math.ceil((new Date(d.expiry) - new Date()) / 86400000);
  return days > 0 && days <= 30;
};
export function getVehicleTotalCost(vehicleId, fuelLogs, maintenanceLogs) {
  const id = String(vehicleId);
  const fuel = fuelLogs.filter(f => String(f.vehicleId) === id).reduce((s, f) => s + (f.totalCost || 0), 0);
  const maint = maintenanceLogs.filter(m => String(m.vehicleId) === id).reduce((s, m) => s + (m.cost || 0), 0);
  return { fuel, maint, total: fuel + maint };
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenanceLogs, setMaintLogs] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Normalise MongoDB _id → id for all docs
  const norm = (arr) => arr.map(doc => ({ ...doc, id: doc._id || doc.id }));

  const fetchAll = useCallback(async () => {
    try {
      const [v, d, t, m, f] = await Promise.all([
        apiGetVehicles(), apiGetDrivers(), apiGetTrips(),
        apiGetMaintenance(), apiGetFuel(),
      ]);
      setVehicles(norm(v));
      setDrivers(norm(d));
      setTrips(norm(t));
      setMaintLogs(norm(m));
      setFuelLogs(norm(f));
    } catch (err) {
      console.error('fetchAll error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('fleetflow_token');
    if (token) fetchAll();
    else setLoading(false);
  }, [fetchAll]);

  // ── VEHICLES ────────────────────────────────────────────────────────────────
  const addVehicle = useCallback(async (data) => {
    const created = await apiAddVehicle(data);
    setVehicles(p => [{ ...created, id: created._id }, ...p]);
  }, []);

  const updateVehicle = useCallback(async (id, data) => {
    const updated = await apiUpdateVehicle(id, data);
    setVehicles(p => p.map(v => (v.id === id || v._id === id) ? { ...updated, id: updated._id } : v));
  }, []);

  const deleteVehicle = useCallback(async (id) => {
    await apiDeleteVehicle(id);
    setVehicles(p => p.filter(v => v.id !== id && v._id !== id));
  }, []);

  const setVehicleStatus = useCallback(async (id, status) => {
    await apiUpdateVehicle(id, { status });
    setVehicles(p => p.map(v => (v.id === id || v._id === id) ? { ...v, status } : v));
  }, []);

  // ── DRIVERS ─────────────────────────────────────────────────────────────────
  const addDriver = useCallback(async (data) => {
    const created = await apiAddDriver(data);
    setDrivers(p => [{ ...created, id: created._id }, ...p]);
  }, []);

  const updateDriver = useCallback(async (id, data) => {
    const updated = await apiUpdateDriver(id, data);
    setDrivers(p => p.map(d => (d.id === id || d._id === id) ? { ...updated, id: updated._id } : d));
  }, []);

  const deleteDriver = useCallback(async (id) => {
    await apiDeleteDriver(id);
    setDrivers(p => p.filter(d => d.id !== id && d._id !== id));
  }, []);

  const setDriverStatus = useCallback(async (id, status) => {
    await apiUpdateDriver(id, { status });
    setDrivers(p => p.map(d => (d.id === id || d._id === id) ? { ...d, status } : d));
  }, []);

  // ── TRIPS ────────────────────────────────────────────────────────────────────
  const addTrip = useCallback(async (data) => {
    const created = await apiAddTrip(data);
    setTrips(p => [{ ...created, id: created._id }, ...p]);
    // Reflect status changes locally for instant UI
    if (data.vehicleId) setVehicles(p => p.map(v => (v.id === data.vehicleId || v._id === data.vehicleId) ? { ...v, status: 'On Trip' } : v));
    if (data.driverId) setDrivers(p => p.map(d => (d.id === data.driverId || d._id === data.driverId) ? { ...d, status: 'On Duty' } : d));
  }, []);

  const updateTripStatus = useCallback(async (tripId, status, odometerEnd) => {
    const updated = await apiUpdateTripStatus(tripId, status, odometerEnd);
    setTrips(p => p.map(t => (t.id === tripId || t._id === tripId) ? { ...updated, id: updated._id } : t));
    // Full re-fetch to sync vehicle/driver status changes from server side-effects
    fetchAll();
  }, [fetchAll]);

  const deleteTrip = useCallback(async (id) => {
    await apiDeleteTrip(id);
    setTrips(p => p.filter(t => t.id !== id && t._id !== id));
  }, []);

  // ── MAINTENANCE ──────────────────────────────────────────────────────────────
  const addMaintenance = useCallback(async (data) => {
    const created = await apiAddMaintenance(data);
    setMaintLogs(p => [{ ...created, id: created._id }, ...p]);
    setVehicles(p => p.map(v => (v.id === data.vehicleId || v._id === data.vehicleId) ? { ...v, status: 'In Shop' } : v));
  }, []);

  const completeMaintenance = useCallback(async (logId) => {
    const updated = await apiCompleteMaintenance(logId);
    setMaintLogs(p => p.map(m => (m.id === logId || m._id === logId) ? { ...updated, id: updated._id } : m));
    fetchAll(); // re-sync vehicle status
  }, [fetchAll]);

  const deleteMaintenance = useCallback(async (id) => {
    await apiDeleteMaintenance(id);
    setMaintLogs(p => p.filter(m => m.id !== id && m._id !== id));
  }, []);

  // ── FUEL ─────────────────────────────────────────────────────────────────────
  const addFuel = useCallback(async (data) => {
    const created = await apiAddFuel(data);
    setFuelLogs(p => [{ ...created, id: created._id }, ...p]);
  }, []);

  const deleteFuel = useCallback(async (id) => {
    await apiDeleteFuel(id);
    setFuelLogs(p => p.filter(f => f.id !== id && f._id !== id));
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
