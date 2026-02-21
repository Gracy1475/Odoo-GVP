import React, { useState, useEffect } from 'react';
import { maintenanceService, vehicleService } from '../services/api';
import {
    Wrench, PlusCircle, Truck, History, CheckCircle,
    Info, X, Search, Filter, Calendar, DollarSign, Hammer, Tag, Clock
} from 'lucide-react';

const MaintenanceLogs = () => {
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [viewMode, setViewMode] = useState('Active'); // Active vs History

    const [formData, setFormData] = useState({
        vehicle_id: '',
        service_type: '',
        category: 'Repair',
        description: '',
        cost: '',
        odometer_at_service: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logRes, vehRes] = await Promise.all([
                maintenanceService.getLogs(),
                vehicleService.getVehicles()
            ]);
            setLogs(logRes.data);
            setVehicles(vehRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await maintenanceService.createEntry(formData);
            setIsModalOpen(false);
            setFormData({ vehicle_id: '', service_type: '', category: 'Repair', description: '', cost: '', odometer_at_service: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to log maintenance');
        }
    };

    const handleComplete = async (id) => {
        if (!confirm("Confirm service completion? Vehicle will be set to 'Available'.")) return;
        try {
            await maintenanceService.completeMaintenance(id);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to complete maintenance');
        }
    };

    // Filter logic
    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.service_type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'All' || log.category === filterCategory;
        const matchesView = viewMode === 'Active' ? !log.completion_date : !!log.completion_date;
        return matchesSearch && matchesCategory && matchesView;
    });

    const activeRepairs = vehicles.filter(v => v.status === 'In Shop').length;
    const mtdSpend = logs.reduce((acc, log) => {
        const logDate = new Date(log.service_date);
        const now = new Date();
        if (logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear()) {
            return acc + parseFloat(log.cost);
        }
        return acc;
    }, 0);

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Maintenance & Service</h1>
                    <p style={{ color: 'hsl(215, 20%, 50%)' }}>Precision fleet health tracking and workshop management.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <PlusCircle size={18} /> New Service Mission
                </button>
            </div>

            {/* KPI Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card shadow-sm">
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(215, 20%, 50%)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Workshop</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{activeRepairs}</h3>
                        <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'hsla(var(--status-in-shop), 0.15)', color: 'hsl(var(--status-in-shop))' }}>
                            <Wrench size={22} />
                        </div>
                    </div>
                </div>
                <div className="card shadow-sm">
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(215, 20%, 50%)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MTD Spend</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>₹{mtdSpend.toLocaleString()}</h3>
                        <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'hsla(215, 20%, 50%, 0.1)', color: 'hsl(215, 20%, 20%)' }}>
                            <DollarSign size={22} />
                        </div>
                    </div>
                </div>
                <div className="card shadow-sm">
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(215, 20%, 50%)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Cost/Serv</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                            ₹{logs.length > 0 ? (logs.reduce((a, b) => a + parseFloat(b.cost), 0) / logs.length).toFixed(0).toLocaleString() : 0}
                        </h3>
                        <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'hsla(215, 20%, 50%, 0.1)', color: 'hsl(215, 20%, 20%)' }}>
                            <History size={22} />
                        </div>
                    </div>
                </div>
                <div className="card shadow-sm">
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(215, 20%, 50%)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Completion</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{logs.filter(l => !l.completion_date).length}</h3>
                        <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'hsla(35, 90%, 50%, 0.1)', color: 'hsl(35, 90%, 40%)' }}>
                            <Clock size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(215, 20%, 60%)' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search by vehicle plate or service type..."
                        className="form-control"
                        style={{ paddingLeft: '40px', width: '100%', backgroundColor: 'white' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="btn-group" style={{ display: 'flex', backgroundColor: 'white', padding: '0.3rem', borderRadius: '10px', border: '1px solid hsl(var(--border))' }}>
                    <button
                        className={`btn ${viewMode === 'Active' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setViewMode('Active')}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                    >
                        Active Works
                    </button>
                    <button
                        className={`btn ${viewMode === 'History' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setViewMode('History')}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                    >
                        Service History
                    </button>
                </div>
                <select
                    className="form-control"
                    style={{ width: '180px', backgroundColor: 'white' }}
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    <option value="Preventive">Preventive</option>
                    <option value="Repair">Repair</option>
                    <option value="Emergency">Emergency</option>
                </select>
            </div>

            <div className="card shadow-sm" style={{ padding: 0 }}>
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Vehicle Detail</th>
                                <th>Service Information</th>
                                <th>Financials</th>
                                <th>Timeline</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '4rem' }}>Synchronizing with workshop...</td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '4rem' }}>No service records found.</td></tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>
                                        <div style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>{log.plate_number}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(215, 20%, 50%)' }}>{log.model}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{log.service_type}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'hsl(215, 20%, 60%)', marginTop: '0.2rem' }}>
                                            <Tag size={10} /> {log.category}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>₹{parseFloat(log.cost).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(215, 20%, 60%)' }}>{log.odometer_at_service.toLocaleString()} km</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Calendar size={12} color="hsl(215, 20%, 60%)" /> Started: {new Date(log.service_date).toLocaleDateString()}
                                            </div>
                                            {log.completion_date && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--status-available))' }}>
                                                    <CheckCircle size={12} /> Done: {new Date(log.completion_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${log.completion_date ? 'available' : 'in-shop'}`}>
                                            {log.completion_date ? 'Fulfillment' : 'In Work'}
                                        </span>
                                    </td>
                                    <td>
                                        {!log.completion_date && (
                                            <button
                                                onClick={() => handleComplete(log.id)}
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                            >
                                                <CheckCircle size={14} /> Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Service Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 100,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="card glass shadow-xl" style={{ width: '550px', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
                                <Wrench size={24} color="hsl(var(--primary))" /> Deploy Maintenance Mission
                            </h3>
                            <X style={{ cursor: 'pointer', color: 'hsl(215, 20%, 60%)' }} onClick={() => setIsModalOpen(false)} />
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'hsl(215, 20%, 30%)', marginBottom: '0.4rem' }}>Vehicle Selection</label>
                                <select
                                    required
                                    className="form-control"
                                    value={formData.vehicle_id}
                                    onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                                    style={{ width: '100%', backgroundColor: 'hsl(215, 20%, 98%)' }}
                                >
                                    <option value="">-- Select Asset for Service --</option>
                                    {vehicles.filter(v => v.status !== 'On Trip').map(v => (
                                        <option key={v.id} value={v.id}>{v.plate_number} ({v.status})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'hsl(215, 20%, 30%)', marginBottom: '0.4rem' }}>Service Type</label>
                                    <input required placeholder="e.g. Engine Overhaul" className="form-control" value={formData.service_type} onChange={e => setFormData({ ...formData, service_type: e.target.value })} style={{ width: '100%' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'hsl(215, 20%, 30%)', marginBottom: '0.4rem' }}>Category</label>
                                    <select className="form-control" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%' }}>
                                        <option value="Preventive">Preventive</option>
                                        <option value="Repair">Repair</option>
                                        <option value="Emergency">Emergency</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'hsl(215, 20%, 30%)', marginBottom: '0.4rem' }}>Detailed Diagnostic Description</label>
                                <textarea
                                    className="form-control"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%', minHeight: '100px', backgroundColor: 'hsl(215, 20%, 98%)' }}
                                    placeholder="Provide root cause and repair plan..."
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'hsl(215, 20%, 30%)', marginBottom: '0.4rem' }}>Estimated Cost (₹)</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 600 }}>₹</span>
                                        <input type="number" required className="form-control" style={{ paddingLeft: '30px', width: '100%' }} value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'hsl(215, 20%, 30%)', marginBottom: '0.4rem' }}>Current Odometer (km)</label>
                                    <input type="number" required className="form-control" value={formData.odometer_at_service} onChange={e => setFormData({ ...formData, odometer_at_service: e.target.value })} style={{ width: '100%' }} />
                                </div>
                            </div>

                            <div style={{ padding: '1rem', backgroundColor: 'hsla(var(--status-in-shop), 0.1)', borderRadius: '12px', border: '1px dashed hsla(var(--status-in-shop), 0.3)' }}>
                                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--status-in-shop))', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                                    <Info size={16} /> Status will toggle to 'In Shop' upon deployment.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Abort Mission</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>Commit to Service</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceLogs;
