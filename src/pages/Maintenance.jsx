import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Wrench, CheckCircle, Trash2 } from 'lucide-react';

const SERVICE_TYPES = ['Oil Change', 'Tyre Rotation', 'Brake Inspection', 'Engine Tuneup', 'AC Service', 'Battery Replacement', 'Transmission Service', 'Other'];

export default function Maintenance() {
    const { state, addMaintenance, completeMaintenance, deleteMaintenance } = useApp();
    const { vehicles, maintenanceLogs } = state;
    const [modal, setModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ vehicleId: '', type: 'Oil Change', cost: '', date: '', notes: '' });

    const eligibleVehicles = useMemo(() => vehicles.filter(v => v.status !== 'On Trip'), [vehicles]);
    const sorted = useMemo(() => [...maintenanceLogs].sort((a, b) => (b.date || '').localeCompare(a.date || '')), [maintenanceLogs]);
    const totalCost = maintenanceLogs.reduce((s, m) => s + (m.cost || 0), 0);

    const handleAdd = async () => {
        if (!form.vehicleId || !form.cost || !form.date) { toast.error('Vehicle, cost, and date are required'); return; }
        setSaving(true);
        try {
            await addMaintenance({ ...form, cost: Number(form.cost) });
            const veh = vehicles.find(v => v.id === form.vehicleId);
            toast.success(`Maintenance logged for ${veh?.name}. Status → In Shop`);
            setModal(false);
            setForm({ vehicleId: '', type: 'Oil Change', cost: '', date: '', notes: '' });
        } catch { toast.error('Failed to save. Check Firestore rules.'); }
        setSaving(false);
    };

    const handleComplete = async (log) => {
        await completeMaintenance(log.id);
        const veh = vehicles.find(v => v.id === log.vehicleId);
        toast.success(`Maintenance complete. ${veh?.name} → Available`);
    };

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div className="page-header-left"><h1>Maintenance & Service Logs</h1><p>Total cost: <strong>₹{totalCost.toLocaleString()}</strong></p></div>
                <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Log Service</button>
            </div>
            <div className="kpi-grid" style={{ marginBottom: 24 }}>
                {[{ label: 'Total Logs', value: maintenanceLogs.length, color: 'blue' }, { label: 'In Progress', value: maintenanceLogs.filter(m => m.status === 'In Progress').length, color: 'amber' }, { label: 'Completed', value: maintenanceLogs.filter(m => m.status === 'Completed').length, color: 'green' }, { label: 'Total Cost', value: `₹${totalCost.toLocaleString()}`, color: 'purple' }].map(({ label, value, color }) => (
                    <div key={label} className={`kpi-card ${color}`}><div className="kpi-label">{label}</div><div className="kpi-value" style={{ fontSize: 26, color: `var(--accent-${color === 'blue' ? 'blue-light' : color})` }}>{value}</div></div>
                ))}
            </div>
            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead><tr><th>Vehicle</th><th>Service Type</th><th>Cost</th><th>Date</th><th>Notes</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {state.loading ? (
                                <tr><td colSpan={7}><div className="empty-state"><div style={{ width: 24, height: 24, border: '2px solid var(--accent-blue)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div></td></tr>
                            ) : sorted.length === 0 ? (
                                <tr><td colSpan={7}><div className="empty-state"><Wrench size={40} /><p>No maintenance logs yet</p></div></td></tr>
                            ) : sorted.map(log => {
                                const veh = vehicles.find(v => v.id === log.vehicleId);
                                return (
                                    <tr key={log.id}>
                                        <td><div style={{ fontWeight: 600 }}>{veh?.name || 'Unknown'}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{veh?.plate}</div></td>
                                        <td><span className="badge badge-warning"><Wrench size={10} /> {log.type}</span></td>
                                        <td style={{ fontWeight: 600 }}>₹{Number(log.cost).toLocaleString()}</td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{log.date}</td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 200 }}>{log.notes || '—'}</td>
                                        <td><StatusPill status={log.status} /></td>
                                        <td>
                                            <div className="table-actions">
                                                {log.status === 'In Progress' && <button className="btn btn-success btn-sm" onClick={() => handleComplete(log)}><CheckCircle size={13} /> Complete</button>}
                                                <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--accent-red)' }} onClick={() => deleteMaintenance(log.id).then(() => toast.success('Removed'))}><Trash2 size={13} /></button>
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
                <Modal title="Log Service Entry" onClose={() => setModal(false)}
                    footer={<><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-amber" onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : 'Log Service'}</button></>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--accent-amber)' }}>
                            ⚠️ Logging a service will automatically set the vehicle status to <strong>In Shop</strong>.
                        </div>
                        <div className="form-group"><label className="form-label">Vehicle *</label>
                            <select className="form-select" value={form.vehicleId} onChange={e => setForm(p => ({ ...p, vehicleId: e.target.value }))}>
                                <option value="">— Select Vehicle —</option>
                                {eligibleVehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate}) — {v.status}</option>)}
                            </select>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">Service Type</label><select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>{SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                            <div className="form-group"><label className="form-label">Cost (₹) *</label><input className="form-input" type="number" min="0" placeholder="4500" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Service Date *</label><input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" placeholder="Describe work performed…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
