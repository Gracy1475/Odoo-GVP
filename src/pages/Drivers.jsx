import { useState, useMemo } from 'react';
import { useApp, isLicenseExpired, isLicenseSoonExpiring } from '../context/AppContext';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Users, Edit2, Trash2, AlertTriangle, ShieldCheck, ShieldX } from 'lucide-react';

const LICENSE_CLASSES = ['LMV', 'HMV', 'LMV,HMV', 'MCWG'];
const STATUSES = ['On Duty', 'Off Duty', 'Suspended'];
const EMPTY = { name: '', license: '', licenseClass: 'LMV', expiry: '', status: 'Off Duty', safetyScore: 85 };

export default function Drivers() {
    const { state, addDriver, updateDriver, deleteDriver, setDriverStatus } = useApp();
    const { drivers, trips } = state;
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [saving, setSaving] = useState(false);

    const filtered = useMemo(() => statusFilter === 'All' ? drivers : drivers.filter(d => d.status === statusFilter), [drivers, statusFilter]);

    const openAdd = () => { setForm(EMPTY); setEditId(null); setModal('add'); };
    const openEdit = (d) => { setForm({ ...d, safetyScore: String(d.safetyScore) }); setEditId(d.id); setModal('edit'); };

    const handleSave = async () => {
        if (!form.name || !form.license || !form.expiry) { toast.error('Name, license and expiry required'); return; }
        setSaving(true);
        try {
            const payload = { ...form, safetyScore: Number(form.safetyScore) };
            if (modal === 'add') { await addDriver(payload); toast.success(`Driver ${form.name} added`); }
            else { await updateDriver(editId, payload); toast.success(`${form.name} updated`); }
            setModal(null);
        } catch { toast.error('Failed to save.'); }
        setSaving(false);
    };

    const cycleStatus = async (d) => {
        const next = STATUSES[(STATUSES.indexOf(d.status) + 1) % STATUSES.length];
        if (d.assignedVehicle && next !== 'On Duty') { toast.error('Cannot change status while on a trip'); return; }
        await setDriverStatus(d.id, next);
        toast.success(`${d.name} → ${next}`);
    };

    const getDriverStats = (driverId) => ({
        completed: trips.filter(t => t.driverId === driverId && t.status === 'Completed').length,
        cancelled: trips.filter(t => t.driverId === driverId && t.status === 'Cancelled').length,
    });

    const inp = (f) => ({ value: String(form[f] || ''), onChange: e => setForm(p => ({ ...p, [f]: e.target.value })) });

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div className="page-header-left"><h1>Driver Profiles &amp; Safety</h1><p>Compliance, performance and safety scores — {drivers.length} enrolled</p></div>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Driver</button>
            </div>
            <div className="kpi-grid" style={{ marginBottom: 24 }}>
                {[{ label: 'On Duty', value: drivers.filter(d => d.status === 'On Duty').length, color: 'green' }, { label: 'Off Duty', value: drivers.filter(d => d.status === 'Off Duty').length, color: 'blue' }, { label: 'Suspended', value: drivers.filter(d => d.status === 'Suspended').length, color: 'amber' }, { label: 'License Expired', value: drivers.filter(d => isLicenseExpired(d)).length, color: 'purple' }].map(({ label, value, color }) => (
                    <div key={label} className={`kpi-card ${color}`}><div className="kpi-label">{label}</div><div className="kpi-value" style={{ fontSize: 28, color: `var(--accent-${color === 'blue' ? 'blue-light' : color})` }}>{value}</div></div>
                ))}
            </div>
            <div className="filter-bar">
                {['All', 'On Duty', 'Off Duty', 'Suspended'].map(s => <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatusFilter(s)}>{s}</button>)}
            </div>
            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead><tr><th>Driver</th><th>License</th><th>Class</th><th>Expiry</th><th>Safety Score</th><th>Trip Rate</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {state.loading ? (<tr><td colSpan={8}><div className="empty-state"><div style={{ width: 24, height: 24, border: '2px solid var(--accent-blue)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div></td></tr>)
                                : filtered.length === 0 ? (<tr><td colSpan={8}><div className="empty-state"><Users size={40} /><p>No drivers found</p></div></td></tr>)
                                    : filtered.map(d => {
                                        const expired = isLicenseExpired(d), soon = isLicenseSoonExpiring(d);
                                        const { completed, cancelled } = getDriverStats(d.id);
                                        const total = completed + cancelled;
                                        const rate = total ? Math.round((completed / total) * 100) : 0;
                                        return (
                                            <tr key={d.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent-purple),var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>{d.name?.[0]}</div>
                                                        <div><div style={{ fontWeight: 600 }}>{d.name}</div>{d.assignedVehicle && <div style={{ fontSize: 11, color: 'var(--accent-blue-light)' }}>On Trip</div>}</div>
                                                    </div>
                                                </td>
                                                <td><code style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.license}</code></td>
                                                <td><span className="badge badge-info">{d.licenseClass}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <span style={{ fontSize: 13 }}>{d.expiry}</span>
                                                        {expired ? <span className="badge badge-danger"><ShieldX size={10} /> Expired</span> : soon ? <span className="badge badge-warning"><AlertTriangle size={10} /> Soon</span> : <ShieldCheck size={14} style={{ color: 'var(--accent-green)' }} />}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ fontWeight: 700, fontSize: 15, color: d.safetyScore >= 80 ? 'var(--accent-green)' : d.safetyScore >= 60 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>{d.safetyScore}</span>
                                                        <div style={{ flex: 1, minWidth: 60 }}><div className="progress-bar"><div className="progress-fill" style={{ width: `${d.safetyScore}%`, background: d.safetyScore >= 80 ? 'var(--accent-green)' : d.safetyScore >= 60 ? 'var(--accent-amber)' : 'var(--accent-red)' }} /></div></div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: 12 }}>
                                                        <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{completed} done</span>
                                                        {cancelled > 0 && <span style={{ color: 'var(--accent-red)', marginLeft: 6 }}>{cancelled} cancel</span>}
                                                        {total > 0 && <div style={{ marginTop: 4 }}><div className="progress-bar"><div className="progress-fill green" style={{ width: `${rate}%` }} /></div></div>}
                                                    </div>
                                                </td>
                                                <td><StatusPill status={d.status} /></td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button className="btn btn-ghost btn-sm" onClick={() => cycleStatus(d)}><span style={{ fontSize: 11 }}>Toggle</span></button>
                                                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(d)}><Edit2 size={13} /></button>
                                                        <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--accent-red)' }} onClick={() => { if (d.assignedVehicle) { toast.error('Cannot delete driver on a trip'); return; } deleteDriver(d.id).then(() => toast.success(`${d.name} removed`)); }}><Trash2 size={13} /></button>
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
                <Modal title={modal === 'add' ? 'Add New Driver' : 'Edit Driver'} onClose={() => setModal(null)}
                    footer={<><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : modal === 'add' ? 'Add Driver' : 'Save Changes'}</button></>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" placeholder="Arjun Sharma" {...inp('name')} /></div>
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">License Number *</label><input className="form-input" placeholder="MH-DL-20198822" {...inp('license')} /></div>
                            <div className="form-group"><label className="form-label">License Class</label><select className="form-select" {...inp('licenseClass')}>{LICENSE_CLASSES.map(c => <option key={c}>{c}</option>)}</select></div>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">License Expiry *</label><input className="form-input" type="date" {...inp('expiry')} /></div>
                            <div className="form-group"><label className="form-label">Status</label><select className="form-select" {...inp('status')}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Safety Score (0–100): {form.safetyScore}</label>
                            <input type="range" min="0" max="100" style={{ width: '100%', accentColor: 'var(--accent-blue)' }} {...inp('safetyScore')} />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
