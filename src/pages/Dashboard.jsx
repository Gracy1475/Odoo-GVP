import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';
import { Truck, Wrench, Activity, Package, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
    const { state } = useApp();
    const { currentUser } = useAuth();
    const { vehicles, drivers, trips, maintenanceLogs } = state;

    const kpis = useMemo(() => {
        const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
        const inShop = vehicles.filter(v => v.status === 'In Shop').length;
        const available = vehicles.filter(v => v.status === 'Available').length;
        const total = vehicles.filter(v => v.status !== 'Retired').length;
        const utilization = total ? Math.round((activeFleet / total) * 100) : 0;
        const pendingCargo = trips.filter(t => t.status === 'Draft').length;
        return { activeFleet, inShop, utilization, pendingCargo, available, total };
    }, [vehicles, trips]);

    const fleetChartData = useMemo(() => [
        { name: 'Available', count: kpis.available, color: '#10b981' },
        { name: 'On Trip', count: kpis.activeFleet, color: '#3b82f6' },
        { name: 'In Shop', count: kpis.inShop, color: '#f59e0b' },
        { name: 'Retired', count: vehicles.filter(v => v.status === 'Retired').length, color: '#ef4444' },
    ], [kpis, vehicles]);

    const recentTrips = useMemo(() =>
        [...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
        , [trips]);

    const expiryWarnings = useMemo(() =>
        drivers.filter(d => {
            const days = Math.ceil((new Date(d.expiry) - new Date()) / 86400000);
            return days <= 30;
        })
        , [drivers]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) {
            return (
                <div style={{ background: '#1a2540', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>{label}</p>
                    <p style={{ color: payload[0].fill, fontWeight: 700, fontSize: 16 }}>{payload[0].value} vehicles</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Command Center</h1>
                    <p>Fleet overview &amp; real-time operational status · Welcome back, <strong>{currentUser?.name}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="badge badge-info"><Clock size={11} /> {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                </div>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card blue">
                    <div className="kpi-icon blue"><Truck size={18} /></div>
                    <div className="kpi-label">Active Fleet</div>
                    <div className="kpi-value" style={{ color: 'var(--accent-blue-light)' }}>{kpis.activeFleet}</div>
                    <div className="kpi-sub">of {kpis.total} active vehicles on trip</div>
                </div>
                <div className="kpi-card amber">
                    <div className="kpi-icon amber"><Wrench size={18} /></div>
                    <div className="kpi-label">Maintenance Alerts</div>
                    <div className="kpi-value" style={{ color: 'var(--accent-amber)' }}>{kpis.inShop}</div>
                    <div className="kpi-sub">vehicles currently in shop</div>
                </div>
                <div className="kpi-card green">
                    <div className="kpi-icon green"><Activity size={18} /></div>
                    <div className="kpi-label">Utilization Rate</div>
                    <div className="kpi-value" style={{ color: 'var(--accent-green)' }}>{kpis.utilization}%</div>
                    <div className="kpi-sub">{kpis.available} vehicles available now</div>
                </div>
                <div className="kpi-card purple">
                    <div className="kpi-icon purple"><Package size={18} /></div>
                    <div className="kpi-label">Pending Cargo</div>
                    <div className="kpi-value" style={{ color: 'var(--accent-purple)' }}>{kpis.pendingCargo}</div>
                    <div className="kpi-sub">shipments awaiting assignment</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div className="chart-card">
                    <div className="section-title"><TrendingUp size={16} style={{ color: 'var(--accent-blue)' }} /> Fleet Status Distribution</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={fleetChartData} barSize={40}>
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                {fleetChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="section-title"><AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }} /> Compliance Warnings</div>
                    {expiryWarnings.length === 0 ? (
                        <div className="empty-state" style={{ padding: '30px 0' }}>
                            <CheckCircle size={32} style={{ color: 'var(--accent-green)', opacity: 0.6 }} />
                            <p>All driver licenses valid</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {expiryWarnings.map(d => {
                                const days = Math.ceil((new Date(d.expiry) - new Date()) / 86400000);
                                return (
                                    <div key={d.id} className="info-row">
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{d.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>License: {d.license}</div>
                                        </div>
                                        <span className={`badge ${days <= 0 ? 'badge-danger' : 'badge-warning'}`}>
                                            {days <= 0 ? 'EXPIRED' : `${days}d left`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="section-title"><Clock size={16} style={{ color: 'var(--accent-blue)' }} /> Recent Trips</div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Trip ID</th><th>Route</th><th>Vehicle</th><th>Driver</th><th>Cargo (kg)</th><th>Status</th><th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTrips.map(t => {
                                const veh = vehicles.find(v => v.id === t.vehicleId);
                                const drv = drivers.find(d => d.id === t.driverId);
                                return (
                                    <tr key={t.id}>
                                        <td><code style={{ fontSize: 12, color: 'var(--accent-blue-light)' }}>#{t.id}</code></td>
                                        <td><span style={{ fontWeight: 600 }}>{t.origin}</span> → {t.destination}</td>
                                        <td>{veh?.name || '—'}</td>
                                        <td>{drv?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                                        <td>{t.cargoWeight.toLocaleString()}</td>
                                        <td><StatusPill status={t.status} /></td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t.createdAt}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
