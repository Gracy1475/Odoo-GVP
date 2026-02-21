import React, { useState, useEffect } from 'react';
import { safetyService, driverService, vehicleService } from '../services/api';
import {
    ShieldCheck,
    AlertTriangle,
    TrendingUp,
    Trophy,
    User,
    PlusCircle,
    Activity,
    Search,
    X,
    Shield
} from 'lucide-react';

const SafetyProfiles = () => {
    const [events, setEvents] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        driver_id: '',
        vehicle_id: '',
        event_type: 'Speeding',
        severity: 'Low',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eventRes, leaderRes, driverRes, vehicleRes] = await Promise.all([
                safetyService.getEvents(),
                safetyService.getLeaderboard(),
                driverService.getDrivers(),
                vehicleService.getVehicles()
            ]);
            setEvents(eventRes.data);
            setLeaderboard(leaderRes.data);
            setDrivers(driverRes.data);
            setVehicles(vehicleRes.data);
        } catch (error) {
            console.error('Error fetching safety data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await safetyService.logEvent(formData);
            setIsModalOpen(false);
            setFormData({ driver_id: '', vehicle_id: '', event_type: 'Speeding', severity: 'Low', description: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to log safety event');
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'hsl(var(--status-available))';
        if (score >= 70) return 'hsl(var(--status-retired))'; // Using retired as warning yellow sometimes
        return 'hsl(var(--status-retired))';
    };

    const getSeverityBadge = (sev) => {
        const colors = {
            'Low': 'hsla(var(--primary), 0.1)',
            'Medium': 'rgba(255, 165, 0, 0.1)',
            'High': 'hsla(var(--status-retired), 0.1)'
        };
        const textColors = {
            'Low': 'hsl(var(--primary))',
            'Medium': 'orange',
            'High': 'hsl(var(--status-retired))'
        };
        return <span style={{
            backgroundColor: colors[sev],
            color: textColors[sev],
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase'
        }}>{sev}</span>;
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Safety & Performance</h1>
                    <p style={{ color: 'hsl(215, 20%, 50%)' }}>Monitoring driver behavior and fleet risk profiles.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <PlusCircle size={18} /> Log Safety Violation
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Leaderboard */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trophy size={20} /> Safety Leaderboard
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {leaderboard.map((driver, index) => (
                            <div key={driver.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                backgroundColor: index < 3 ? 'hsla(var(--primary), 0.03)' : 'transparent',
                                borderRadius: '12px',
                                border: index < 3 ? '1px dashed hsla(var(--primary), 0.2)' : '1px solid transparent'
                            }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 700, width: '20px', color: 'hsl(215, 20%, 65%)' }}>#{index + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{driver.full_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'hsl(215, 20%, 50%)' }}>{driver.violations_count || 0} violations recorded</div>
                                </div>
                                <div style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    backgroundColor: 'hsl(var(--secondary))',
                                    textAlign: 'center',
                                    minWidth: '60px'
                                }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: getScoreColor(driver.safety_score) }}>{driver.safety_score}</div>
                                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Event History */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={20} /> Recent Incidents
                    </h3>
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Driver / Asset</th>
                                    <th>Event Type</th>
                                    <th>Severity</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>Analyzing incidents...</td></tr>
                                ) : events.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>Fleet is currently operating safely.</td></tr>
                                ) : events.map((ev) => (
                                    <tr key={ev.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{ev.driver_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'hsl(215, 20%, 50%)' }}>{ev.plate_number}</div>
                                        </td>
                                        <td>{ev.event_type}</td>
                                        <td>{getSeverityBadge(ev.severity)}</td>
                                        <td style={{ fontSize: '0.875rem' }}>{new Date(ev.event_date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="card glass" style={{ width: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShieldCheck size={20} /> Log Safety Incident
                            </h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Driver Involved</label>
                                <select
                                    required value={formData.driver_id}
                                    onChange={e => setFormData({ ...formData, driver_id: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                >
                                    <option value="">-- Select Driver --</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>{d.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Vehicle Involved</label>
                                <select
                                    required value={formData.vehicle_id}
                                    onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                >
                                    <option value="">-- Select Asset --</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.plate_number}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Event Type</label>
                                    <select
                                        value={formData.event_type}
                                        onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                                        style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    >
                                        <option value="Speeding">Speeding</option>
                                        <option value="Hard Braking">Hard Braking</option>
                                        <option value="Sudden Acceleration">Sudden Acceleration</option>
                                        <option value="Route Deviation">Route Deviation</option>
                                        <option value="Long Idling">Long Idling</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Severity</label>
                                    <select
                                        value={formData.severity}
                                        onChange={e => setFormData({ ...formData, severity: e.target.value })}
                                        style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Incident Details</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid hsl(var(--border))', resize: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button type="button" className="btn" style={{ flex: 1, backgroundColor: 'hsl(var(--secondary))' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Log Incident</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SafetyProfiles;
