import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/api';
import {
    Plus,
    Truck,
    MoreVertical,
    PlusCircle,
    X,
    Search,
    Filter,
    AlertTriangle,
    CheckCircle2,
    Activity,
    History,
    Wrench,
    TrendingUp,
    Trash2
} from 'lucide-react';

const VehicleRegistry = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const [formData, setFormData] = useState({
        plate_number: '',
        model: '',
        vehicle_type: 'Truck',
        max_load_capacity_kg: '',
        acquisition_cost: '',
        region: '',
        odometer_km: ''
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await vehicleService.getVehicles();
            setVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (id) => {
        try {
            const response = await vehicleService.getDetails(id);
            setSelectedVehicle(response.data);
        } catch (error) {
            console.error('Error fetching vehicle details:', error);
        }
    };

    const getHealthStatus = (vehicle) => {
        const mileageSinceService = vehicle.odometer_km - (vehicle.last_service_odometer || 0);
        if (mileageSinceService > 10000) return { label: 'CRITICAL', color: 'hsl(var(--status-retired))', icon: <AlertTriangle size={14} /> };
        if (mileageSinceService > 5000) return { label: 'DUE SOON', color: 'orange', icon: <Activity size={14} /> };
        return { label: 'HEALTHY', color: 'hsl(var(--status-available))', icon: <CheckCircle2 size={14} /> };
    };

    const getStatusStyle = (status) => {
        const colors = {
            'Available': 'hsl(var(--status-available))',
            'On Trip': 'hsl(var(--primary))',
            'In Shop': 'hsl(var(--status-in-shop))',
            'Retired': 'hsl(var(--status-retired))'
        };
        const bgColors = {
            'Available': 'hsla(var(--status-available), 0.1)',
            'On Trip': 'hsla(var(--primary), 0.1)',
            'In Shop': 'hsla(var(--status-in-shop), 0.1)',
            'Retired': 'hsla(var(--status-retired), 0.1)'
        };
        return {
            color: colors[status] || 'gray',
            backgroundColor: bgColors[status] || '#f4f4f4',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
        };
    };

    const handleDeleteVehicle = async (id, plate) => {
        if (window.confirm(`Are you sure you want to permanently delete vehicle ${plate}? This action cannot be undone.`)) {
            try {
                await vehicleService.deleteVehicle(id);
                fetchVehicles();
                if (selectedVehicle?.id === id) setSelectedVehicle(null);
            } catch (error) {
                alert(error.response?.data?.error || 'Failed to delete vehicle');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await vehicleService.addVehicle(formData);
            setIsModalOpen(false);
            setFormData({
                plate_number: '', model: '', vehicle_type: 'Truck',
                max_load_capacity_kg: '', acquisition_cost: '', region: '', odometer_km: ''
            });
            fetchVehicles();
        } catch (error) {
            alert(error.response?.data?.error || 'Error adding vehicle');
        }
    };

    // Unified search and status filter
    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = v.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.model.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="page-container" style={{ display: 'flex', gap: '2rem' }}>
            {/* Main Content */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="page-title" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Asset Logistics Hub</h1>
                        <p style={{ color: 'hsl(215, 20%, 50%)' }}>Precision management of your fleet assets and mechanical health.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <PlusCircle size={18} /> Add Vehicle
                    </button>
                </div>

                {/* Filters & Search */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(215, 20%, 60%)' }} size={18} />
                        <input
                            type="text"
                            placeholder="Search by plate or model..."
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
                            <option value="All">All Status</option>
                            <option value="Available">Available</option>
                            <option value="On Trip">On Trip</option>
                            <option value="In Shop">In Shop</option>
                        </select>
                    </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Asset Detials</th>
                                    <th>Status</th>
                                    <th>Maintenance</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>Syncing with Fleet DB...</td></tr>
                                ) : filteredVehicles.map((v) => {
                                    const health = getHealthStatus(v);
                                    return (
                                        <tr key={v.id}
                                            onClick={() => handleViewDetails(v.id)}
                                            style={{ cursor: 'pointer', transition: 'background 0.2s', borderLeft: selectedVehicle?.id === v.id ? '4px solid hsl(var(--primary))' : '4px solid transparent' }}
                                        >
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ padding: '0.75rem', backgroundColor: 'hsl(var(--secondary))', borderRadius: '12px', color: 'hsl(var(--primary))' }}>
                                                        <Truck size={20} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{v.plate_number}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'hsl(215, 20%, 50%)' }}>{v.model} • {v.vehicle_type}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={getStatusStyle(v.status)}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getStatusStyle(v.status).color }} />
                                                    {v.status}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: health.color, fontWeight: 700, fontSize: '0.75rem' }}>
                                                    {health.icon} {health.label}
                                                    <div style={{ fontSize: '0.7rem', color: 'hsl(215, 20%, 60%)', fontWeight: 400 }}>
                                                        {v.odometer_km.toLocaleString()} km
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <ChevronRight size={18} color="hsl(215, 20%, 70%)" />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteVehicle(v.id, v.plate_number);
                                                        }}
                                                        className="btn"
                                                        style={{ padding: '0.25rem', color: 'hsl(var(--status-retired))' }}
                                                        title="Delete Vehicle"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Side Detail Panel */}
            {selectedVehicle && (
                <div className="card glass" style={{ width: '400px', flexShrink: 0, height: 'fit-content', position: 'sticky', top: '2rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <div>
                            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>{selectedVehicle.region || 'Global Fleet'}</span>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedVehicle.plate_number}</h2>
                            <p style={{ color: 'hsl(215, 20%, 50%)', fontSize: '0.875rem' }}>{selectedVehicle.model}</p>
                        </div>
                        <X style={{ cursor: 'pointer' }} onClick={() => setSelectedVehicle(null)} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <InfoItem label="Capacity" value={`${selectedVehicle.max_load_capacity_kg} kg`} icon={<TrendingUp size={14} />} />
                        <InfoItem label="Odometer" value={`${selectedVehicle.odometer_km} km`} icon={<Activity size={14} />} />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            <History size={16} /> Recent Mission History
                        </h4>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {selectedVehicle.recent_trips?.length === 0 ? <EmptyState msg="No trip history found" /> :
                                selectedVehicle.recent_trips?.map(trip => (
                                    <HistoryRow key={trip.id} title={`Mission #${trip.id}`} sub={`${trip.cargo_weight_kg}kg cargo`} result={`₹${trip.revenue}`} />
                                ))}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            <Wrench size={16} /> Maintenance Records
                        </h4>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {selectedVehicle.maintenance_history?.length === 0 ? <EmptyState msg="No service logs found" /> :
                                selectedVehicle.maintenance_history?.map(log => (
                                    <HistoryRow
                                        key={log.id}
                                        title={log.description}
                                        sub={new Date(log.service_date).toLocaleDateString()}
                                        result={`₹${log.cost}`}
                                        color="orange"
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Vehicle Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card glass" style={{ width: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Truck size={20} /> Register New Asset</h3>
                            <X style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FormGroup label="Plate Number" value={formData.plate_number} onChange={v => setFormData({ ...formData, plate_number: v })} placeholder="GJ-01-AX-1234" />
                                <FormGroup label="Model" value={formData.model} onChange={v => setFormData({ ...formData, model: v })} placeholder="Tata Prima" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Asset Category</label>
                                    <select
                                        className="form-control"
                                        value={formData.vehicle_type}
                                        onChange={e => setFormData({ ...formData, vehicle_type: e.target.value })}
                                        style={{ width: '100%', padding: '0.625rem', borderRadius: '10px' }}
                                    >
                                        <option value="Truck">Heavy Truck</option>
                                        <option value="Van">Cargo Van</option>
                                        <option value="Bike">Last-Mile Bike</option>
                                    </select>
                                </div>
                                <FormGroup label="Max Payload (kg)" type="number" value={formData.max_load_capacity_kg} onChange={v => setFormData({ ...formData, max_load_capacity_kg: v })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FormGroup label="Acquisition Cost" type="number" value={formData.acquisition_cost} onChange={v => setFormData({ ...formData, acquisition_cost: v })} />
                                <FormGroup label="Initial Odometer (km)" type="number" value={formData.odometer_km} onChange={v => setFormData({ ...formData, odometer_km: v })} placeholder="0" />
                            </div>
                            <div className="form-group">
                                <FormGroup label="Operational Region" value={formData.region} onChange={v => setFormData({ ...formData, region: v })} placeholder="West Zone" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" style={{ flex: 1, backgroundColor: 'hsl(var(--secondary))' }} onClick={() => setIsModalOpen(false)}>Abort</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Finalize Registration</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoItem = ({ label, value, icon }) => (
    <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(215, 20%, 50%)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            {icon} {label}
        </div>
        <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>{value}</div>
    </div>
);

const HistoryRow = ({ title, sub, result, color = 'var(--primary)' }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'white', borderRadius: '10px', border: '1px solid hsla(var(--border), 0.5)' }}>
        <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{title}</div>
            <div style={{ fontSize: '0.7rem', color: 'hsl(215, 20%, 60%)' }}>{sub}</div>
        </div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: `hsl(${color})` }}>{result}</div>
    </div>
);

const FormGroup = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div className="form-group">
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{label}</label>
        <input
            className="form-control"
            type={type}
            required
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ width: '100%', padding: '0.625rem', borderRadius: '10px' }}
        />
    </div>
);

const EmptyState = ({ msg }) => <div style={{ textAlign: 'center', padding: '1rem', fontSize: '0.8125rem', color: 'hsl(215, 20%, 60%)', fontStyle: 'italic' }}>{msg}</div>;

const ChevronRight = ({ size, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);

export default VehicleRegistry;
