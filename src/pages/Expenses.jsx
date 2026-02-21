import { useState, useMemo } from 'react';
import { useApp, getVehicleTotalCost } from '../context/AppContext';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Fuel, Trash2, TrendingDown } from 'lucide-react';

export default function Expenses() {
    const { state, addFuel, deleteFuel } = useApp();
    const { vehicles, fuelLogs, maintenanceLogs } = state;
    const [modal, setModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ vehicleId: '', liters: '', costPerLiter: '', date: '', odometer: '', kmDriven: '' });

    const sorted = useMemo(() => [...fuelLogs].sort((a, b) => (b.date || '').localeCompare(a.date || '')), [fuelLogs]);
    const vehicleCosts = useMemo(() => vehicles.map(v => {
        const { fuel, maint, total } = getVehicleTotalCost(v.id, fuelLogs, maintenanceLogs);
        return { ...v, fuel, maint, total };
    }).sort((a, b) => b.total - a.total), [vehicles, fuelLogs, maintenanceLogs]);

    const grandTotal = vehicleCosts.reduce((s, v) => s + v.total, 0);
    const grandFuel = vehicleCosts.reduce((s, v) => s + v.fuel, 0);
    const grandMaint = vehicleCosts.reduce((s, v) => s + v.maint, 0);

    const handleAdd = async () => {
        if (!form.vehicleId || !form.liters || !form.costPerLiter || !form.date) { toast.error('Vehicle, liters, cost/liter and date required'); return; }
        const liters = Number(form.liters), costPerLiter = Number(form.costPerLiter);
        setSaving(true);
        try {
            await addFuel({ ...form, liters, costPerLiter, totalCost: liters * costPerLiter, odometer: Number(form.odometer) || 0, kmDriven: Number(form.kmDriven) || 0 });
            toast.success('Fuel log added');
            setModal(false);
            setForm({ vehicleId: '', liters: '', costPerLiter: '', date: '', odometer: '', kmDriven: '' });
        } catch { toast.error('Failed to save.'); }
        setSaving(false);
    };

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div className="page-header-left"><h1>Expenses &amp; Fuel Logging</h1><p>Total operational cost: <strong>₹{grandTotal.toLocaleString()}</strong></p></div>
                <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Log Fuel</button>
            </div>
            <div className="kpi-grid" style={{ marginBottom: 24 }}>
                {[{ label: 'Total Op. Cost', value: `₹${grandTotal.toLocaleString()}`, color: 'purple' }, { label: 'Fuel Costs', value: `₹${grandFuel.toLocaleString()}`, color: 'amber' }, { label: 'Maintenance Costs', value: `₹${grandMaint.toLocaleString()}`, color: 'blue' }, { label: 'Fuel Entries', value: fuelLogs.length, color: 'green' }].map(({ label, value, color }) => (
                    <div key={label} className={`kpi-card ${color}`}><div className="kpi-label">{label}</div><div className="kpi-value" style={{ fontSize: 22, color: `var(--accent-${color === 'blue' ? 'blue-light' : color})` }}>{value}</div></div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24 }}>
                <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '20px 20px 0' }} className="section-title"><Fuel size={16} style={{ color: 'var(--accent-amber)' }} /> Fuel Log</div>
                    <div className="table-wrapper" style={{ border: 'none' }}>
                        <table className="data-table">
                            <thead><tr><th>Vehicle</th><th>Liters</th><th>Cost/L</th><th>Total</th><th>km/L</th><th>Date</th><th></th></tr></thead>
                            <tbody>
                                {sorted.length === 0 ? (<tr><td colSpan={7}><div className="empty-state" style={{ padding: '30px 0' }}><Fuel size={32} /><p>No fuel logs</p></div></td></tr>)
                                    : sorted.map(f => {
                                        const veh = vehicles.find(v => v.id === f.vehicleId);
                                        const kmL = f.kmDriven && f.liters ? (f.kmDriven / f.liters).toFixed(1) : '—';
                                        return (
                                            <tr key={f.id}>
                                                <td style={{ fontWeight: 600 }}>{veh?.name || '—'}</td>
                                                <td>{f.liters}L</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>₹{f.costPerLiter}/L</td>
                                                <td style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>₹{Number(f.totalCost).toLocaleString()}</td>
                                                <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{kmL}{kmL !== '—' ? ` km/L` : ''}</td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{f.date}</td>
                                                <td><button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--accent-red)' }} onClick={() => deleteFuel(f.id).then(() => toast.success('Removed'))}><Trash2 size={13} /></button></td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card">
                    <div className="section-title"><TrendingDown size={16} style={{ color: 'var(--accent-purple)' }} /> Cost Breakdown by Vehicle</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {vehicleCosts.filter(v => v.total > 0).map(v => (
                            <div key={v.id} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <div><span style={{ fontWeight: 600, fontSize: 13.5 }}>{v.name}</span><span style={{ marginLeft: 8, fontSize: 11.5, color: 'var(--text-muted)' }}>{v.plate}</span></div>
                                    <span style={{ fontWeight: 700, color: 'var(--accent-purple)', fontSize: 14 }}>₹{v.total.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}><span>⛽ Fuel: ₹{v.fuel.toLocaleString()}</span><span>🔧 Maint: ₹{v.maint.toLocaleString()}</span></div>
                                <div className="progress-bar" style={{ marginTop: 8 }}><div className="progress-fill amber" style={{ width: grandTotal ? `${(v.total / grandTotal) * 100}%` : '0%' }} /></div>
                            </div>
                        ))}
                        {vehicleCosts.filter(v => v.total > 0).length === 0 && <div className="empty-state" style={{ padding: '20px 0' }}><p>No cost data yet</p></div>}
                    </div>
                </div>
            </div>
            {modal && (
                <Modal title="Log Fuel Entry" onClose={() => setModal(false)}
                    footer={<><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-amber" onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : 'Add Fuel Log'}</button></>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group"><label className="form-label">Vehicle *</label>
                            <select className="form-select" value={form.vehicleId} onChange={e => setForm(p => ({ ...p, vehicleId: e.target.value }))}>
                                <option value="">— Select Vehicle —</option>
                                {vehicles.filter(v => v.status !== 'Retired').map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
                            </select>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">Liters *</label><input className="form-input" type="number" min="0" step="0.1" placeholder="45" value={form.liters} onChange={e => setForm(p => ({ ...p, liters: e.target.value }))} /></div>
                            <div className="form-group"><label className="form-label">Cost per Liter (₹) *</label><input className="form-input" type="number" min="0" step="0.1" placeholder="102.50" value={form.costPerLiter} onChange={e => setForm(p => ({ ...p, costPerLiter: e.target.value }))} /></div>
                        </div>
                        {form.liters && form.costPerLiter && <div style={{ background: 'var(--accent-blue-dim)', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, color: 'var(--accent-blue-light)', fontWeight: 600 }}>Total: ₹{(Number(form.liters) * Number(form.costPerLiter)).toFixed(2)}</div>}
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                            <div className="form-group"><label className="form-label">Odometer (km)</label><input className="form-input" type="number" min="0" placeholder="42550" value={form.odometer} onChange={e => setForm(p => ({ ...p, odometer: e.target.value }))} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">KM Driven Since Last Fill</label><input className="form-input" type="number" min="0" placeholder="347" value={form.kmDriven} onChange={e => setForm(p => ({ ...p, kmDriven: e.target.value }))} /></div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
