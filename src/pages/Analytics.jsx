import { useMemo } from 'react';
import { useApp, getVehicleTotalCost } from '../context/AppContext';
import toast from 'react-hot-toast';
import { Download, FileText, BarChart2, TrendingUp, Fuel } from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

export default function Analytics() {
    const { state } = useApp();
    const { vehicles, fuelLogs, maintenanceLogs, trips, drivers } = state;

    const fuelEfficiency = useMemo(() => vehicles.map(v => {
        const logs = fuelLogs.filter(f => f.vehicleId === v.id && f.kmDriven > 0 && f.liters > 0);
        const avg = logs.length ? (logs.reduce((s, f) => s + f.kmDriven / f.liters, 0) / logs.length) : 0;
        return { name: v.name, kmL: parseFloat(avg.toFixed(2)), type: v.type };
    }).filter(v => v.kmL > 0), [vehicles, fuelLogs]);

    const vehicleROI = useMemo(() => vehicles.map(v => {
        const { fuel, maint, total } = getVehicleTotalCost(v.id, fuelLogs, maintenanceLogs);
        const revenue = trips.filter(t => t.vehicleId === v.id && t.status === 'Completed').reduce((s, t) => s + (t.revenue || 0), 0);
        const roi = v.acquiCost > 0 ? parseFloat(((revenue - total) / v.acquiCost * 100).toFixed(1)) : 0;
        return { name: v.name, roi, revenue, fuel, maint, total, plate: v.plate };
    }), [vehicles, fuelLogs, maintenanceLogs, trips]);

    const monthlyFuel = useMemo(() => {
        const byMonth = {};
        fuelLogs.forEach(f => { const m = f.date?.slice(0, 7); if (m) byMonth[m] = (byMonth[m] || 0) + f.totalCost; });
        return Object.entries(byMonth).sort().map(([month, cost]) => ({ month, cost }));
    }, [fuelLogs]);

    const exportCSV = () => {
        const rows = [
            ['Vehicle', 'Plate', 'Revenue (₹)', 'Fuel Cost (₹)', 'Maintenance (₹)', 'Total Op Cost (₹)', 'ROI (%)'],
            ...vehicleROI.map(v => [v.name, v.plate, v.revenue, v.fuel, v.maint, v.total, v.roi]),
        ];
        const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'fleetflow_report.csv' });
        a.click(); URL.revokeObjectURL(a.href);
        toast.success('CSV exported!');
    };

    const exportPDF = () => {
        import('jspdf').then(({ default: jsPDF }) => {
            const doc = new jsPDF();
            doc.setFontSize(18); doc.setFont(undefined, 'bold');
            doc.text('FleetFlow — Financial Report', 14, 20);
            doc.setFontSize(11); doc.setFont(undefined, 'normal');
            doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);
            doc.line(14, 32, 196, 32);
            let y = 42;
            doc.setFontSize(13); doc.setFont(undefined, 'bold'); doc.text('Vehicle ROI Summary', 14, y); y += 10;
            doc.setFontSize(10); doc.setFont(undefined, 'normal');
            vehicleROI.forEach(v => {
                doc.text(`${v.name} (${v.plate})`, 16, y);
                doc.text(`Revenue: ₹${v.revenue.toLocaleString()}  |  Op. Cost: ₹${v.total.toLocaleString()}  |  ROI: ${v.roi}%`, 16, y + 6);
                y += 16;
                if (y > 270) { doc.addPage(); y = 20; }
            });
            doc.save('fleetflow_report.pdf');
            toast.success('PDF exported!');
        });
    };

    const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{ background: '#1a2540', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
                <p style={{ color: '#94a3b8', marginBottom: 6 }}>{label}</p>
                {payload.map((p, i) => <p key={i} style={{ color: p.color || p.fill, fontWeight: 700 }}>{p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}</p>)}
            </div>
        );
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    const totalRevenue = trips.filter(t => t.status === 'Completed').reduce((s, t) => s + (t.revenue || 0), 0);
    const totalOpCost = vehicles.reduce((s, v) => s + getVehicleTotalCost(v.id, fuelLogs, maintenanceLogs).total, 0);
    const avgSafety = drivers.length ? Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length) : 0;

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div className="page-header-left"><h1>Analytics &amp; Reports</h1><p>Operational insights, fuel efficiency, and financial performance</p></div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-ghost" onClick={exportCSV}><Download size={15} /> CSV</button>
                    <button className="btn btn-primary" onClick={exportPDF}><FileText size={15} /> PDF Report</button>
                </div>
            </div>
            <div className="kpi-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'green' },
                    { label: 'Total Op. Cost', value: `₹${totalOpCost.toLocaleString()}`, color: 'amber' },
                    { label: 'Trips Completed', value: trips.filter(t => t.status === 'Completed').length, color: 'blue' },
                    { label: 'Avg Safety Score', value: `${avgSafety}`, color: 'purple' },
                ].map(({ label, value, color }) => (
                    <div key={label} className={`kpi-card ${color}`}><div className="kpi-label">{label}</div><div className="kpi-value" style={{ fontSize: 22, color: `var(--accent-${color === 'blue' ? 'blue-light' : color})` }}>{value}</div></div>
                ))}
            </div>
            <div className="charts-grid" style={{ marginBottom: 24 }}>
                <div className="chart-card">
                    <div className="section-title"><Fuel size={16} style={{ color: 'var(--accent-amber)' }} /> Fuel Efficiency (km/L)</div>
                    {fuelEfficiency.length === 0 ? <div className="empty-state"><p>Add fuel logs with km driven to see efficiency</p></div> : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={fuelEfficiency} barSize={36}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} unit=" km/L" />
                                <Tooltip content={<CustomTooltip suffix=" km/L" />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                                <Bar dataKey="kmL" name="Efficiency" radius={[6, 6, 0, 0]}>{fuelEfficiency.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div className="chart-card">
                    <div className="section-title"><TrendingUp size={16} style={{ color: 'var(--accent-green)' }} /> Monthly Fuel Spend (₹)</div>
                    {monthlyFuel.length === 0 ? <div className="empty-state"><p>No fuel log data available</p></div> : (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={monthlyFuel}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip prefix="₹" />} />
                                <Line type="monotone" dataKey="cost" name="Fuel Spend" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
            <div className="card">
                <div className="section-title"><BarChart2 size={16} style={{ color: 'var(--accent-blue)' }} /> Vehicle ROI Summary</div>
                <div className="table-wrapper" style={{ border: 'none' }}>
                    <table className="data-table">
                        <thead><tr><th>Vehicle</th><th>Revenue (₹)</th><th>Fuel (₹)</th><th>Maintenance (₹)</th><th>Total Op. Cost (₹)</th><th>Net Profit</th><th>ROI %</th></tr></thead>
                        <tbody>
                            {vehicleROI.map(v => {
                                const net = v.revenue - v.total;
                                return (
                                    <tr key={v.name}>
                                        <td><strong>{v.name}</strong><div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{v.plate}</div></td>
                                        <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>₹{v.revenue.toLocaleString()}</td>
                                        <td>₹{v.fuel.toLocaleString()}</td>
                                        <td>₹{v.maint.toLocaleString()}</td>
                                        <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>₹{v.total.toLocaleString()}</td>
                                        <td style={{ fontWeight: 700, color: net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{net >= 0 ? '+' : ''}₹{net.toLocaleString()}</td>
                                        <td><span style={{ fontWeight: 700, color: v.roi >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: 14 }}>{v.roi}%</span></td>
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
