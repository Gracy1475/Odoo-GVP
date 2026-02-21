import React, { useState, useEffect } from 'react';
import { fuelService, vehicleService, tripService } from '../services/api';
import { Fuel, PlusCircle, Truck, Calculator, TrendingUp, DollarSign, X } from 'lucide-react';

const FuelLogs = () => {
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        vehicle_id: '',
        trip_id: '',
        liters: '',
        cost: '',
        odometer_reading: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logRes, vehRes, tripRes] = await Promise.all([
                fuelService.getLogs(),
                vehicleService.getVehicles(),
                tripService.getTrips()
            ]);
            setLogs(logRes.data);
            setVehicles(vehRes.data);
            setTrips(tripRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fuelService.createEntry(formData);
            setIsModalOpen(false);
            setFormData({ vehicle_id: '', trip_id: '', liters: '', cost: '', odometer_reading: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to log fuel entry');
        }
    };

    const totalCost = logs.reduce((acc, log) => acc + parseFloat(log.cost), 0);
    const totalLiters = logs.reduce((acc, log) => acc + parseFloat(log.liters), 0);
    const avgPrice = totalLiters > 0 ? totalCost / totalLiters : 0;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Fuel & Expenses</h1>
                    <p style={{ color: 'hsl(215, 20%, 50%)' }}>Monitor fuel efficiency and operational spending.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <PlusCircle size={18} /> New Fuel Entry
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: 'hsl(215, 20%, 50%)', marginBottom: '0.5rem' }}>Total Spend</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: '1.5rem' }}>₹{totalCost.toLocaleString()}</h3>
                        <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}>
                            <DollarSign size={20} />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: 'hsl(215, 20%, 50%)', marginBottom: '0.5rem' }}>Total Consumption</p>
                    <h3 style={{ fontSize: '1.5rem' }}>{totalLiters.toFixed(2)} L</h3>
                </div>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: 'hsl(215, 20%, 50%)', marginBottom: '0.5rem' }}>Avg. Fuel Price</p>
                    <h3 style={{ fontSize: '1.5rem' }}>₹{avgPrice.toFixed(2)}/L</h3>
                </div>
                <div className="card">
                    <p style={{ fontSize: '0.875rem', color: 'hsl(215, 20%, 50%)', marginBottom: '0.5rem' }}>Fleet Entries</p>
                    <h3 style={{ fontSize: '1.5rem' }}>{logs.length}</h3>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Trip Reference</th>
                                <th>Liters</th>
                                <th>Cost (₹)</th>
                                <th>Efficiency</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Analyzing fuel data...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No fuel logs recorded yet.</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{log.plate_number}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(215, 20%, 50%)' }}>{log.model}</div>
                                    </td>
                                    <td>{log.trip_id ? `#TRP-${log.trip_id}` : 'General / Top-up'}</td>
                                    <td style={{ fontWeight: 500 }}>{parseFloat(log.liters).toFixed(2)} L</td>
                                    <td style={{ fontWeight: 600 }}>₹{parseFloat(log.cost).toLocaleString()}</td>
                                    <td>
                                        <div style={{ fontSize: '0.875rem' }}>
                                            ₹{(parseFloat(log.cost) / parseFloat(log.liters)).toFixed(2)} / L
                                        </div>
                                    </td>
                                    <td>{new Date(log.log_date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
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
                    <div className="card glass" style={{ width: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Fuel size={20} /> Log Fuel Purchase
                            </h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Select Vehicle</label>
                                <select
                                    required
                                    value={formData.vehicle_id}
                                    onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                >
                                    <option value="">-- Select Asset --</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.plate_number} ({v.model})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Associate with Trip (Optional)</label>
                                <select
                                    value={formData.trip_id}
                                    onChange={e => setFormData({ ...formData, trip_id: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                >
                                    <option value="">-- General Expense --</option>
                                    {trips.filter(t => t.vehicle_id == formData.vehicle_id).map(t => (
                                        <option key={t.id} value={t.id}>Trip #TRP-{t.id} ({new Date(t.dispatch_date).toLocaleDateString()})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Liters</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.liters}
                                        onChange={e => setFormData({ ...formData, liters: e.target.value })}
                                        style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Cost (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.cost}
                                        onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                        style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Current Odometer (km)</label>
                                <input
                                    type="number"
                                    value={formData.odometer_reading}
                                    onChange={e => setFormData({ ...formData, odometer_reading: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button type="button" className="btn" style={{ flex: 1, backgroundColor: 'hsl(var(--secondary))' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Logging</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FuelLogs;
