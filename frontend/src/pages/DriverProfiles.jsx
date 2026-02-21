import React, { useState, useEffect } from 'react';
import { driverService } from '../services/api';
import { Users, Shield, Calendar, AlertTriangle, PlusCircle, X, CheckCircle2, Search, Filter, User } from 'lucide-react';

const DriverProfiles = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [formData, setFormData] = useState({
        full_name: '',
        license_number: '',
        license_expiry: '',
        status: 'Off Duty'
    });

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const response = await driverService.getDrivers();
            setDrivers(response.data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await driverService.updateStatus(id, newStatus);
            fetchDrivers();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await driverService.addDriver(formData);
            setIsModalOpen(false);
            setFormData({
                full_name: '',
                license_number: '',
                license_expiry: '',
                status: 'Off Duty'
            });
            fetchDrivers();
        } catch (error) {
            alert(error.response?.data?.error || 'Error adding driver');
        }
    };

    const isExpired = (date) => new Date(date) < new Date();

    const filteredDrivers = drivers.filter(d => {
        const matchesSearch = d.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.license_number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        const colors = {
            'On Duty': 'hsl(var(--status-available))',
            'Off Duty': 'hsl(215, 20%, 50%)',
            'On Trip': 'hsl(var(--primary))',
            'Suspended': 'hsl(var(--status-retired))'
        };
        return {
            color: colors[status] || 'gray',
            fontWeight: 700,
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
        };
    };

    const getSafetyColor = (score) => {
        if (score >= 90) return 'hsl(var(--status-available))';
        if (score >= 75) return 'orange';
        return 'hsl(var(--status-retired))';
    };

    return (
        <div className="page-container">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Driver Profiles</h1>
                    <p style={{ color: 'hsl(215, 20%, 50%)' }}>Monitor driver compliance, safety scores, and duty status.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <PlusCircle size={18} /> Register Driver
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: 'hsl(215, 20%, 50%)', marginBottom: '0.5rem' }}>Total Personnel</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: '1.5rem' }}>{drivers.length}</h3>
                        <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}>
                            <Users size={20} />
                        </div>
                    </div>
                </div>
                {['On Duty', 'On Trip', 'Suspended'].map(status => (
                    <div key={status} className="card">
                        <p style={{ fontSize: '0.875rem', color: 'hsl(215, 20%, 50%)', marginBottom: '0.5rem' }}>{status}</p>
                        <h3 style={{ fontSize: '1.5rem' }}>{drivers.filter(d => d.status === status).length}</h3>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(215, 20%, 60%)' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or license..."
                        className="form-control"
                        style={{ paddingLeft: '40px', width: '100%', backgroundColor: 'white' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid hsl(var(--border))' }}>
                    <Filter size={16} color="hsl(215, 20%, 50%)" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ border: 'none', fontSize: '0.875rem', fontWeight: 600, outline: 'none' }}
                    >
                        <option value="All">All Personnel</option>
                        <option value="On Duty">On Duty</option>
                        <option value="Off Duty">Off Duty</option>
                        <option value="On Trip">On Trip</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Personnel Detail</th>
                                <th>License Info</th>
                                <th style={{ textAlign: 'center' }}>Safety Score</th>
                                <th>Status</th>
                                <th>Compliance Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Syncing personnel registers...</td></tr>
                            ) : filteredDrivers.map((driver) => {
                                const expired = isExpired(driver.license_expiry);
                                return (
                                    <tr key={driver.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ padding: '0.5rem', backgroundColor: 'hsl(var(--secondary))', borderRadius: '10px', color: 'hsl(var(--primary))' }}>
                                                    <User size={18} />
                                                </div>
                                                <div style={{ fontWeight: 700 }}>{driver.full_name}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{driver.license_number}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: expired ? 'hsl(var(--status-retired))' : 'hsl(215, 20%, 50%)' }}>
                                                <Calendar size={12} /> Exp: {new Date(driver.license_expiry).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                fontSize: '1.25rem',
                                                fontWeight: 800,
                                                color: getSafetyColor(driver.safety_score),
                                                backgroundColor: `hsla(${getSafetyColor(driver.safety_score).slice(4, -1)}, 0.1)`,
                                                padding: '4px 12px',
                                                borderRadius: '8px'
                                            }}>
                                                {driver.safety_score}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                value={driver.status}
                                                onChange={(e) => handleStatusChange(driver.id, e.target.value)}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    backgroundColor: 'hsla(var(--secondary), 0.5)',
                                                    border: '1px solid hsl(var(--border))',
                                                    color: getStatusStyle(driver.status).color
                                                }}
                                            >
                                                <option value="On Duty" disabled={driver.status === 'On Trip'}>On Duty</option>
                                                <option value="Off Duty" disabled={driver.status === 'On Trip'}>Off Duty</option>
                                                <option value="On Trip" disabled={driver.status !== 'On Trip'}>On Trip</option>
                                                <option value="Suspended">Suspended</option>
                                            </select>
                                        </td>
                                        <td>
                                            {expired ? (
                                                <span className="badge" style={{ backgroundColor: 'hsla(var(--status-retired), 0.1)', color: 'hsl(var(--status-retired))', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <AlertTriangle size={14} /> BLOCKED (EXPIRED)
                                                </span>
                                            ) : (
                                                <span className="badge" style={{ backgroundColor: 'hsla(var(--status-available), 0.1)', color: 'hsl(var(--status-available))', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Shield size={14} /> ACTIVE COMPLIANT
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Register Driver Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="card glass" style={{ width: '450px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3>Register New Driver</h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>License Number</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.license_number}
                                    onChange={e => setFormData({ ...formData, license_number: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>License Expiry</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.license_expiry}
                                    onChange={e => setFormData({ ...formData, license_expiry: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" style={{ flex: 1, backgroundColor: 'hsl(var(--secondary))' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Register Personnel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverProfiles;
