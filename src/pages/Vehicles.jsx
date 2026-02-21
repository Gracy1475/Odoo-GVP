import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import StatusPill from '../components/StatusPill';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, ToggleRight, Truck } from 'lucide-react';

const TYPES = ['Truck', 'Van', 'Bike'];
const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const EMPTY = { name: '', model: '', plate: '', type: 'Van', capacity: '', odometer: '', region: 'North', acquiCost: '' };

export default function Vehicles() {
    const { state, addVehicle, updateVehicle, deleteVehicle, setVehicleStatus } = useApp();
    const { vehicles } = state;

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const filtered = useMemo(() => vehicles.filter(v => {
        const matchSearch = !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.plate?.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'All' || v.type === typeFilter;
        const matchStatus = statusFilter === 'All' || v.status === statusFilter;
        return matchSearch && matchType && matchStatus;
    }), [vehicles, search, typeFilter, statusFilter]);

    const openAdd = () => { setForm(EMPTY); setEditId(null); setModal('add'); };
    const openEdit = (v) => { setForm({ ...v, capacity: String(v.capacity), odometer: String(v.odometer), acquiCost: String(v.acquiCost || '') }); setEditId(v.id); setModal('edit'); };

    const handleSave = async () => {
        if (!form.name || !form.plate || !form.capacity) { toast.error('Name, plate and capacity are required'); return; }
        if (isNaN(Number(form.capacity)) || Number(form.capacity) <= 0) { toast.error('Capacity must be a positive number'); return; }
        const plateExists = vehicles.some(v => v.plate?.toUpperCase() === form.plate.toUpperCase() && v.id !== editId);
        if (plateExists) { toast.error('License plate already exists'); return; }
        const payload = { ...form, capacity: Number(form.capacity), odometer: Number(form.odometer) || 0, acquiCost: Number(form.acquiCost) || 0, plate: form.plate.toUpperCase() };
        setSaving(true);
        try {
            if (modal === 'add') { await addVehicle(payload); toast.success(`${form.name} added`); }
            else { await updateVehicle(editId, payload); toast.success(`${form.name} updated`); }
            setModal(null);
        } catch { toast.error('Failed to save. Check Firestore rules.'); }
        setSaving(false);
    };

    const handleDelete = async (v) => {
        if (v.status === 'On Trip') { toast.error('Cannot delete a vehicle currently on a trip'); return; }
        await deleteVehicle(v.id);
        toast.success(`${v.name} removed`);
    };

    const handleRetireToggle = async (v) => {
        const s = v.status === 'Retired' ? 'Available' : 'Retired';
        await setVehicleStatus(v.id, s);
        toast.success(`${v.name} → ${s}`);
    };

    const inp = (field) => ({ value: form[field] || '', onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) });

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Vehicle Registry</h1>
                    <p>Manage fleet assets — {vehicles.length} total vehicles</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Vehicle</button>
            </div>

            <div className="filter-bar">
                <div className="search-input-wrap">
                    <Search size={15} className="search-icon" />
                    <input className="form-input" placeholder="Search name, plate…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-select" style={{ width: 130 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                    <option value="All">All Types</option>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <select className="form-select" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    {['All', 'Available', 'On Trip', 'In Shop', 'Retired'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
                </select>
                <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} result(s)</span>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead><tr><th>Vehicle</th><th>Type</th><th>Plate</th><th>Capacity</th><th>Odometer</th><th>Region</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {state.loading ? (
                                <tr><td colSpan={8}><div className="empty-state"><div style={{ width: 24, height: 24, border: '2px solid var(--accent-blue)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8}><div className="empty-state"><Truck size={40} /><p>No vehicles found</p></div></td></tr>
                            ) : filtered.map(v => (
                                <tr key={v.id}>
                                    <td><div style={{ fontWeight: 600 }}>{v.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.model}</div></td>
                                    <td><span className="badge badge-info">{v.type}</span></td>
                                    <td><code style={{ fontSize: 12.5, color: 'var(--accent-blue-light)' }}>{v.plate}</code></td>
                                    <td>{Number(v.capacity).toLocaleString()} kg</td>
                                    <td>{Number(v.odometer).toLocaleString()} km</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{v.region}</td>
                                    <td><StatusPill status={v.status} /></td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(v)}><Edit2 size={14} /></button>
                                            <button className={`btn btn-sm btn-icon ${v.status === 'Retired' ? 'btn-success' : 'btn-ghost'}`}
                                                onClick={() => handleRetireToggle(v)} disabled={v.status === 'On Trip' || v.status === 'In Shop'}>
                                                <ToggleRight size={14} />
                                            </button>
                                            <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--accent-red)' }} onClick={() => handleDelete(v)}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <Modal title={modal === 'add' ? 'Add New Vehicle' : 'Edit Vehicle'} onClose={() => setModal(null)}
                    footer={<><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : modal === 'add' ? 'Add Vehicle' : 'Save Changes'}</button></>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">Vehicle Name *</label><input className="form-input" placeholder="Van-05" {...inp('name')} /></div>
                            <div className="form-group"><label className="form-label">Model</label><input className="form-input" placeholder="Ford Transit" {...inp('model')} /></div>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">License Plate *</label><input className="form-input" placeholder="KA-01-AB-1234" {...inp('plate')} /></div>
                            <div className="form-group"><label className="form-label">Type</label><select className="form-select" {...inp('type')}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">Max Capacity (kg) *</label><input className="form-input" type="number" min="1" placeholder="500" {...inp('capacity')} /></div>
                            <div className="form-group"><label className="form-label">Odometer (km)</label><input className="form-input" type="number" min="0" placeholder="0" {...inp('odometer')} /></div>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">Region</label><select className="form-select" {...inp('region')}>{REGIONS.map(r => <option key={r}>{r}</option>)}</select></div>
                            <div className="form-group"><label className="form-label">Acquisition Cost (₹)</label><input className="form-input" type="number" min="0" placeholder="900000" {...inp('acquiCost')} /></div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
