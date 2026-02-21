import React, { useState, useEffect } from 'react';
import { tripService, vehicleService, driverService } from '../services/api';
import {
    Navigation, PlusCircle, Truck, User, Calendar, CheckCircle,
    AlertCircle, X, Search, MapPin, DollarSign, Package, Filter, Trash2, Edit2, Play
} from 'lucide-react';

const TripDispatcher = () => {
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTrip, setEditingTrip] = useState(null);

    const [formData, setFormData] = useState({
        vehicle_id: '',
        driver_id: '',
        cargo_weight_kg: '',
        revenue: '',
        origin_address: '',
        destination_address: '',
        status: 'Dispatched'
    });

    // Searchable selection states
    const [vehSearch, setVehSearch] = useState('');
    const [driSearch, setDriSearch] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tripRes, vehRes, driRes] = await Promise.all([
                tripService.getTrips(),
                vehicleService.getVehicles(),
                driverService.getDrivers()
            ]);
            setTrips(tripRes.data);
            setVehicles(vehRes.data);
            setDrivers(driRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            vehicle_id: '', driver_id: '', cargo_weight_kg: '',
            revenue: '', origin_address: '', destination_address: '', status: 'Dispatched'
        });
        setVehSearch('');
        setDriSearch('');
        setEditingTrip(null);
    };

    const handleCreateOrUpdateTrip = async (e, forcedStatus) => {
        if (e) e.preventDefault();
        const payload = { ...formData, status: forcedStatus || formData.status };

        try {
            if (editingTrip) {
                await tripService.updateTrip(editingTrip.id, payload);
            } else {
                await tripService.createTrip(payload);
            }
            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to process trip');
        }
    };

    const handleCompleteTrip = async (id) => {
        const odometer = prompt("Enter final odometer reading (KM):");
        if (odometer === null) return;
        try {
            await tripService.completeTrip(id, parseInt(odometer));
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to complete trip');
        }
    };

    const handleDeleteTrip = async (id) => {
        if (!window.confirm("Delete this draft trip?")) return;
        try {
            await tripService.deleteTrip(id);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete trip');
        }
    };

    const openEditModal = (trip) => {
        setEditingTrip(trip);
        setFormData({
            vehicle_id: trip.vehicle_id || '',
            driver_id: trip.driver_id || '',
            cargo_weight_kg: trip.cargo_weight_kg,
            revenue: trip.revenue,
            origin_address: trip.origin_address || '',
            destination_address: trip.destination_address || '',
            status: trip.status
        });
        setVehSearch(trip.plate_number || '');
        setDriSearch(trip.driver_name || '');
        setIsModalOpen(true);
    };

    // Filters for modal context (Available for new dispatch, or current asset if editing)
    const availableVehicles = vehicles.filter(v =>
        v.status === 'Available' || (editingTrip && v.id === editingTrip.vehicle_id)
    ).filter(v => v.plate_number.toLowerCase().includes(vehSearch.toLowerCase()));

    const availableDrivers = drivers.filter(d =>
        d.status === 'On Duty' || (editingTrip && d.id === editingTrip.driver_id)
    ).filter(d => (d.full_name || '').toLowerCase().includes(driSearch.toLowerCase()));

    // Registry search
    const filteredTrips = trips.filter(t =>
        t.id.toString().includes(searchQuery) ||
        (t.plate_number?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (t.driver_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Trip Dispatcher</h1>
                    <p style={{ color: 'hsl(215, 20%, 50%)' }}>Precision lifecycle management for logistics missions.</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    <PlusCircle size={18} /> New Dispatch
                </button>
            </div>

            {/* Global Search */}
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(215, 20%, 60%)' }} size={18} />
                <input
                    type="text"
                    placeholder="Search trips by ID, vehicle plate, or driver name..."
                    className="form-control"
                    style={{ paddingLeft: '40px', width: '100%', backgroundColor: 'white' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Trip Detail</th>
                                <th>Route Info</th>
                                <th>Resource Allocation</th>
                                <th>Finance & Cargo</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Syncing mission data...</td></tr>
                            ) : filteredTrips.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No missions matching search.</td></tr>
                            ) : filteredTrips.map((trip) => (
                                <tr key={trip.id}>
                                    <td>
                                        <div style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>#TRP-{trip.id}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'hsl(215, 20%, 60%)' }}>
                                            Created: {new Date(trip.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <MapPin size={12} color="hsl(var(--status-available))" /> {trip.origin_address || 'TBD'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Navigation size={12} color="hsl(var(--status-retired))" /> {trip.destination_address || 'TBD'}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                                                <Truck size={14} /> {trip.plate_number || 'N/A'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'hsl(215, 20%, 50%)' }}>
                                                <User size={14} /> {trip.driver_name || 'Unassigned'}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>₹{parseFloat(trip.revenue).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(215, 20%, 60%)' }}>{parseFloat(trip.cargo_weight_kg).toLocaleString()} kg</div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${trip.status.toLowerCase()}`}>
                                            {trip.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {trip.status === 'Dispatched' && (
                                                <button onClick={() => handleCompleteTrip(trip.id)} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>
                                                    Complete
                                                </button>
                                            )}
                                            {trip.status === 'Draft' && (
                                                <>
                                                    <button onClick={() => openEditModal(trip)} className="btn" style={{ padding: '0.3rem', backgroundColor: 'hsl(var(--secondary))' }}>
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteTrip(trip.id)} className="btn btn-ghost" style={{ padding: '0.3rem', color: 'hsl(var(--status-retired))' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Advanced Dispatch Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="card glass" style={{ width: '550px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Navigation size={20} /> {editingTrip ? `Edit Mission #${editingTrip.id}` : 'Prepare New Mission'}
                            </h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
                        </div>
                        <form style={{ display: 'grid', gap: '1.25rem' }}>
                            {/* Addresses */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.3rem' }}>Origin</label>
                                    <input placeholder="City, Station" className="form-control" value={formData.origin_address} onChange={e => setFormData({ ...formData, origin_address: e.target.value })} style={{ width: '100%' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.3rem' }}>Destination</label>
                                    <input placeholder="Final Hub" className="form-control" value={formData.destination_address} onChange={e => setFormData({ ...formData, destination_address: e.target.value })} style={{ width: '100%' }} />
                                </div>
                            </div>

                            {/* Cargo & Revenue */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.3rem' }}>Cargo Weight (kg)</label>
                                    <input type="number" className="form-control" value={formData.cargo_weight_kg} onChange={e => setFormData({ ...formData, cargo_weight_kg: e.target.value })} style={{ width: '100%' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.3rem' }}>Target Revenue (₹)</label>
                                    <input type="number" className="form-control" value={formData.revenue} onChange={e => setFormData({ ...formData, revenue: e.target.value })} style={{ width: '100%' }} />
                                </div>
                            </div>

                            {/* Resource Selectors (Searchable logic implemented via simple input + filter) */}
                            <div style={{ display: 'grid', gap: '1rem', backgroundColor: 'hsla(var(--secondary), 0.3)', padding: '1rem', borderRadius: '12px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.3rem' }}>Vehicle (Plate)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            placeholder="Search active fleet..."
                                            className="form-control"
                                            value={vehSearch}
                                            onChange={e => { setVehSearch(e.target.value); setFormData({ ...formData, vehicle_id: '' }); }}
                                            style={{ width: '100%' }}
                                        />
                                        {vehSearch && availableVehicles.length > 0 && !formData.vehicle_id && (
                                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ddd', borderRadius: '8px', zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                                {availableVehicles.map(v => (
                                                    <div key={v.id} onClick={() => { setFormData({ ...formData, vehicle_id: v.id }); setVehSearch(v.plate_number); }} style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                                                        {v.plate_number} ({v.max_load_capacity_kg}kg)
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {formData.vehicle_id && (
                                            <button type="button" onClick={() => { setFormData({ ...formData, vehicle_id: '' }); setVehSearch(''); }} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer' }}><X size={14} /></button>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.3rem' }}>Driver (Full Name)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            placeholder="Search on-duty drivers..."
                                            className="form-control"
                                            value={driSearch}
                                            onChange={e => { setDriSearch(e.target.value); setFormData({ ...formData, driver_id: '' }); }}
                                            style={{ width: '100%' }}
                                        />
                                        {driSearch && availableDrivers.length > 0 && !formData.driver_id && (
                                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ddd', borderRadius: '8px', zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                                {availableDrivers.map(d => (
                                                    <div key={d.id} onClick={() => { setFormData({ ...formData, driver_id: d.id }); setDriSearch(d.full_name); }} style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                                                        {d.full_name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {formData.driver_id && (
                                            <button type="button" onClick={() => { setFormData({ ...formData, driver_id: '' }); setDriSearch(''); }} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer' }}><X size={14} /></button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => handleCreateOrUpdateTrip(null, 'Draft')} className="btn" style={{ flex: 1, backgroundColor: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Package size={16} /> Save Draft
                                </button>
                                <button type="button" onClick={() => handleCreateOrUpdateTrip(null, 'Dispatched')} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Play size={16} /> Dispatch Now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripDispatcher;
