import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import {
    Activity,
    Truck,
    TrendingUp,
    AlertCircle,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Circle,
    LayoutDashboard
} from 'lucide-react';

const CommandCenter = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await dashboardService.getStats();
                setStats(response.data);
            } catch (error) {
                console.error('Dashboard Fetch Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{ padding: '2rem' }}>Synchronizing Command Center...</div>;

    const fleetHealth = stats ? (stats.fleet.available / stats.fleet.total) * 100 : 0;

    return (
        <div className="page-container">
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Fleet Command Center</h1>
                <p style={{ color: 'hsl(215, 20%, 50%)' }}>Real-time operational overview and performance KPIs.</p>
            </div>

            {/* Top Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <KPICard
                    title="Active Missions"
                    value={stats?.activeTrips}
                    icon={<Activity size={20} />}
                    color="primary"
                    trend="+12%"
                    isUp={true}
                />
                <KPICard
                    title="Available Assets"
                    value={stats?.fleet.available}
                    icon={<Truck size={20} />}
                    color="success"
                    subtitle={`${stats?.fleet.total} total vehicles`}
                />
                <KPICard
                    title="Net Profit"
                    value={`₹${stats?.finance.profit.toLocaleString()}`}
                    icon={<TrendingUp size={20} />}
                    color="warning"
                    trend="+5.4%"
                    isUp={true}
                />
                <KPICard
                    title="Fleet Health"
                    value={`${fleetHealth.toFixed(1)}%`}
                    icon={<ShieldCheck size={20} />}
                    color="info"
                    subtitle="Ready for deployment"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
                {/* Recent Activity */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
                            <Clock size={18} /> Recent Fleet Activity
                        </h3>
                        <button className="btn" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>View All</button>
                    </div>
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Operation</th>
                                    <th>Resource</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recentActivity.map((act) => (
                                    <tr key={act.id}>
                                        <td style={{ fontWeight: 500 }}>Trip #TRP-{act.id}</td>
                                        <td>
                                            <div style={{ fontSize: '0.875rem' }}>{act.driver_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'hsl(215, 20%, 60%)' }}>{act.plate_number}</div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${act.status.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                                                {act.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.875rem' }}>{new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Fleet Distribution */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Asset Distribution</h3>
                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        <DistributionRow label="Available" count={stats?.fleet.available} total={stats?.fleet.total} color="hsl(var(--status-available))" />
                        <DistributionRow label="On Mission" count={stats?.fleet.on_trip} total={stats?.fleet.total} color="hsl(var(--primary))" />
                        <DistributionRow label="In Service" count={stats?.fleet.in_shop} total={stats?.fleet.total} color="hsl(var(--status-in-shop))" />
                        <DistributionRow label="Retired" count={stats?.fleet.retired || 0} total={stats?.fleet.total} color="hsl(var(--status-retired))" />
                    </div>

                    <div style={{ marginTop: '2.5rem', padding: '1rem', backgroundColor: 'hsla(var(--primary), 0.05)', borderRadius: '12px', border: '1px dashed hsla(var(--primary), 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--primary))', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                            <AlertCircle size={16} /> Capacity Management
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'hsl(215, 20%, 50%)', lineHeight: 1.5 }}>
                            Your fleet is currently at <strong>{((stats?.fleet.on_trip / stats?.fleet.total) * 100).toFixed(0)}%</strong> utilization. Consider maintenance for available assets during low-demand periods.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, icon, color, trend, isUp, subtitle }) => (
    <div className="card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '60px',
            height: '60px',
            backgroundColor: `hsla(var(--primary), 0.03)`,
            borderRadius: '50%'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
                padding: '0.6rem',
                borderRadius: '10px',
                backgroundColor: color === 'primary' ? 'hsla(var(--primary), 0.1)' : 'hsla(var(--secondary), 0.1)',
                color: color === 'primary' ? 'hsl(var(--primary))' : 'inherit'
            }}>
                {icon}
            </div>
            {trend && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: isUp ? 'hsl(var(--status-available))' : 'hsl(var(--status-retired))'
                }}>
                    {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trend}
                </div>
            )}
        </div>
        <h4 style={{ fontSize: '0.8125rem', color: 'hsl(215, 20%, 50%)', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</h4>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{value}</div>
        {subtitle && <p style={{ fontSize: '0.7rem', color: 'hsl(215, 20%, 65%)', marginTop: '0.25rem' }}>{subtitle}</p>}
    </div>
);

const DistributionRow = ({ label, count, total, color }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Circle size={8} fill={color} stroke="none" /> {label}
                </span>
                <span style={{ fontWeight: 600 }}>{count}</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'hsl(var(--secondary))', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, borderRadius: '3px' }} />
            </div>
        </div>
    );
};

const ShieldCheck = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
);

export default CommandCenter;
