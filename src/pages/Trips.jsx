import { useState, useMemo } from 'react';
import { useApp, isLicenseExpired } from '../context/AppContext';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Navigation, CheckCircle, XCircle, ChevronRight, AlertTriangle, Trash2 } from 'lucide-react';

const LIFECYCLE = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

export default function Trips() {
    const { state, addTrip, updateTripStatus, deleteTrip } = useApp();
    const { vehicles, drivers, trips } = state;

    const [filter, setFilter] = useState('All');
    const [modal, setModal] = useState(false);
    const [completionModal, setCompletionModal] = useState(null);
    const [odometerEnd, setOdometerEnd] = useState('');
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', cargoDesc: '', revenue: '', distance: '' });

    const availableVehicles = useMemo(() => vehicles.filter(v => v.status === 'Available'), [vehicles]);
    const availableDrivers = useMemo(() => drivers.filter(d => d.status !== 'Suspended' && !d.assignedVehicle && !isLicenseExpired(d)), [drivers]);
    const selectedVehicle = useMemo(() => vehicles.find(v => v.id === form.vehicleId), [vehicles, form.vehicleId]);
    const cargoNum = Number(form.cargoWeight);
    const capacityExceeded = selectedVehicle && cargoNum > 0 && cargoNum > selectedVehicle.capacity;

    const filtered = useMemo(() => filter === 'All' ? trips : trips.filter(t => t.status === filter), [trips, filter]);
    // Sort by createdAt descending
    const sorted = useMemo(() => [...filtered].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')), [filtered]);

    const handleCreate = async () => {
        if (!form.vehicleId || !form.origin || !form.destination || !form.cargoWeight) {
            toast.error('Vehicle, origin, destination and cargo weight are required'); return;
        }
        if (capacityExceeded) { toast.error(`Cargo ${cargoNum}kg exceeds ${selectedVehicle.name}'s capacity of ${selectedVehicle.capacity}kg!`); return; }
        setSaving(true);
        try {
            await addTrip({ ...form, cargoWeight: cargoNum, revenue: Number(form.revenue) || 0, distance: Number(form.distance) || 0, driverId: form.driverId || null });
            toast.success('Trip created!');
            setModal(false);
            setForm({ vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', cargoDesc: '', revenue: '', distance: '' });
        } catch { toast.error('Failed to create trip.'); }
        setSaving(false);
    };

    const updateStatus = async (trip, status) => {
        if (status === 'Completed') { setCompletionModal(trip); setOdometerEnd(trip.odometerEnd || ''); return; }
        await updateTripStatus(trip.id, status);
        toast.success(`Trip ${status.toLowerCase()}`);
    };

    const confirmComplete = async () => {
        await updateTripStatus(completionModal.id, 'Completed', Number(odometerEnd) || undefined);
        toast.success('Trip completed! Vehicle & driver are now available.');
        setCompletionModal(null);
    };

    const getNextActions = (t) => {
        if (t.status === 'Draft') return [{ label: 'Dispatch', status: 'Dispatched', cls: 'btn-primary', icon: <Navigation size={12} /> }, { label: 'Cancel', status: 'Cancelled', cls: 'btn-danger', icon: <XCircle size={12} /> }];
        if (t.status === 'Dispatched') return [{ label: 'Complete', status: 'Completed', cls: 'btn-success', icon: <CheckCircle size={12} /> }, { label: 'Cancel', status: 'Cancelled', cls: 'btn-danger', icon: <XCircle size={12} /> }];
        return [];
    };

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div className="page-header-left"><h1>Trip Dispatcher</h1><p>Create, assign, and manage logistics trips</p></div>
                <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> New Trip</button>
            </div>

            <div className="filter-bar" style={{ marginBottom: 20 }}>
                {['All', ...LIFECYCLE].map(s => <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(s)}>{s}</button>)}
                <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{sorted.length} trip(s)</span>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead><tr><th>Trip</th><th>Route</th><th>Vehicle</th><th>Driver</th><th>Cargo</th><th>Revenue</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {state.loading ? (
                                <tr><td colSpan={8}><div className="empty-state"><div style={{ width: 24, height: 24, border: '2px solid var(--accent-blue)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div></td></tr>
                            ) : sorted.length === 0 ? (
                                <tr><td colSpan={8}><div className="empty-state"><Navigation size={40} /><p>No trips found</p></div></td></tr>
                            ) : sorted.map(t => {
                                const veh = vehicles.find(v => v.id === t.vehicleId);
                                const drv = drivers.find(d => d.id === t.driverId);
                                const actions = getNextActions(t);
                                return (
                                    <tr key={t.id}>
                                        <td><code style={{ fontSize: 11.5, color: 'var(--accent-blue-light)' }}>#{t.id?.slice(-6)}</code><div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{t.createdAt}</div></td>
                                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>{t.origin} <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} /> {t.destination}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.cargoDesc}</div></td>
                                        <td>{veh?.name || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                        <td>{drv?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                                        <td><span style={{ fontWeight: 600 }}>{Number(t.cargoWeight).toLocaleString()} kg</span>{veh && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ {veh.capacity} kg cap</div>}</td>
                                        <td>{t.revenue ? `₹${Number(t.revenue).toLocaleString()}` : '—'}</td>
                                        <td><StatusPill status={t.status} /></td>
                                        <td>
                                            <div className="table-actions">
                                                {actions.map(a => <button key={a.status} className={`btn ${a.cls} btn-sm`} onClick={() => updateStatus(t, a.status)}>{a.icon} {a.label}</button>)}
                                                {(t.status === 'Completed' || t.status === 'Cancelled') && <button className="btn btn-ghost btn-sm btn-icon" onClick={() => deleteTrip(t.id)} title="Remove"><Trash2 size={13} /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <Modal title="Create New Trip" onClose={() => setModal(false)} wide
                    footer={<><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={capacityExceeded || saving}>{saving ? 'Creating…' : 'Create Trip'}</button></>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {capacityExceeded && (
                            <div style={{ background: 'var(--accent-red-dim)', border: '1px solid var(--accent-red)', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center', color: 'var(--accent-red)', fontSize: 13 }}>
                                <AlertTriangle size={16} /> Cargo weight ({cargoNum}kg) exceeds vehicle capacity ({selectedVehicle?.capacity}kg)! Cannot create trip.
                            </div>
                        )}
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">Vehicle *</label>
                                <select className="form-select" value={form.vehicleId} onChange={e => setForm(p => ({ ...p, vehicleId: e.target.value }))}>
                                    <option value="">— Select Available Vehicle —</option>
                                    {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate}) — {v.capacity}kg cap</option>)}
                                </select>
                                {availableVehicles.length === 0 && <span className="form-error">No vehicles available</span>}
                            </div>
                            <div className="form-group"><label className="form-label">Driver</label>
                                <select className="form-select" value={form.driverId} onChange={e => setForm(p => ({ ...p, driverId: e.target.value }))}>
                                    <option value="">— Select Driver (Optional) —</option>
                                    {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} — Score: {d.safetyScore}</option>)}
                                </select>
                                {availableDrivers.length === 0 && <span className="form-error">No eligible drivers</span>}
                            </div>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">Origin *</label><input className="form-input" placeholder="Mumbai" value={form.origin} onChange={e => setForm(p => ({ ...p, origin: e.target.value }))} /></div>
                            <div className="form-group"><label className="form-label">Destination *</label><input className="form-input" placeholder="Pune" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} /></div>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">Cargo Weight (kg) *</label>
                                <input className="form-input" type="number" min="0" placeholder="450" value={form.cargoWeight} onChange={e => setForm(p => ({ ...p, cargoWeight: e.target.value }))} style={capacityExceeded ? { borderColor: 'var(--accent-red)' } : {}} />
                                {selectedVehicle && <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>Max: {selectedVehicle.capacity.toLocaleString()} kg</span>}
                            </div>
                            <div className="form-group"><label className="form-label">Cargo Description</label><input className="form-input" placeholder="Electronics, Garments…" value={form.cargoDesc} onChange={e => setForm(p => ({ ...p, cargoDesc: e.target.value }))} /></div>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">Expected Revenue (₹)</label><input className="form-input" type="number" min="0" value={form.revenue} onChange={e => setForm(p => ({ ...p, revenue: e.target.value }))} /></div>
                            <div className="form-group"><label className="form-label">Distance (km)</label><input className="form-input" type="number" min="0" value={form.distance} onChange={e => setForm(p => ({ ...p, distance: e.target.value }))} /></div>
                        </div>
                    </div>
                </Modal>
            )}
            {completionModal && (
                <Modal title="Complete Trip" onClose={() => setCompletionModal(null)}
                    footer={<><button className="btn btn-ghost" onClick={() => setCompletionModal(null)}>Cancel</button><button className="btn btn-success" onClick={confirmComplete}><CheckCircle size={14} /> Confirm</button></>}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>Completing this trip frees the vehicle &amp; driver back to Available.</p>
                    <div className="form-group"><label className="form-label">Final Odometer (km)</label><input className="form-input" type="number" placeholder="e.g. 98850" value={odometerEnd} onChange={e => setOdometerEnd(e.target.value)} /></div>
                </Modal>
            )}
        </div>
    );
}
