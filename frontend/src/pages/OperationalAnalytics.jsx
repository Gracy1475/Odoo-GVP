import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import {
    BarChart3,
    Download,
    TrendingUp,
    TrendingDown,
    PieChart,
    FileText,
    ChevronRight,
    Search,
    Truck
} from 'lucide-react';

const OperationalAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await analyticsService.getReport();
                setData(response.data);
            } catch (error) {
                console.error('Analytics Fetch Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const handleCSVExport = () => {
        const url = analyticsService.getCSVUrl();
        window.open(url, '_blank');
    };

    if (loading) return <div style={{ padding: '2rem' }}>Generating Intelligence Report...</div>;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Operational Intelligence</h1>
                    <p style={{ color: 'hsl(215, 20%, 50%)' }}>Return on Investment (ROI) and Fleet Performance Analytics.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" style={{ backgroundColor: 'white', border: '1px solid hsl(var(--border))' }} onClick={handleCSVExport}>
                        <Download size={18} /> Export CSV
                    </button>
                    <button className="btn btn-primary">
                        <FileText size={18} /> Generate PDF
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* ROI by Vehicle */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Truck size={20} /> Revenue vs Cost per Asset
                    </h3>
                    <div style={{ display: 'grid', gap: '2rem' }}>
                        {data?.vehicleROI.map((v) => (
                            <div key={v.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ fontWeight: 600 }}>{v.plate_number}</span>
                                        <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: 'hsl(215, 20%, 50%)' }}>({v.model})</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: v.net_profit >= 0 ? 'hsl(var(--status-available))' : 'hsl(var(--status-retired))' }}>
                                            {v.net_profit >= 0 ? '+' : ''}₹{v.net_profit.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ height: '12px', backgroundColor: 'hsl(var(--secondary))', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                                    <div
                                        style={{
                                            width: `${(v.total_revenue / Math.max(...data.vehicleROI.map(x => x.total_revenue))) * 100}%`,
                                            backgroundColor: 'hsl(var(--primary))',
                                            height: '100%',
                                            transition: 'width 1s ease-out'
                                        }}
                                        title={`Revenue: ₹${v.total_revenue}`}
                                    />
                                    <div
                                        style={{
                                            width: `${(v.total_cost / Math.max(...data.vehicleROI.map(x => x.total_revenue))) * 100}%`,
                                            backgroundColor: 'hsla(var(--status-retired), 0.5)',
                                            height: '100%',
                                            transition: 'width 1s ease-out'
                                        }}
                                        title={`Cost: ₹${v.total_cost}`}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.7rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'hsl(var(--primary))' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'hsl(var(--primary))' }} /> Revenue
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'hsla(var(--status-retired), 0.7)' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'hsla(var(--status-retired), 0.5)' }} /> Expenses
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Cards */}
                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateRows: 'auto auto auto' }}>
                    <div className="card glass" style={{ padding: '1.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: 'hsl(215, 20%, 50%)', marginBottom: '0.5rem' }}>Highest Earner</p>
                        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{data?.vehicleROI[0]?.plate_number}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--status-available))', fontWeight: 600 }}>
                            <TrendingUp size={16} /> ₹{parseFloat(data?.vehicleROI[0]?.total_revenue).toLocaleString()}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: 'hsl(215, 20%, 50%)', marginBottom: '0.5rem' }}>Efficiency Ratio</p>
                        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                            {((data?.vehicleROI.reduce((a, b) => a + b.net_profit, 0) / data?.vehicleROI.reduce((a, b) => a + b.total_revenue, 0)) * 100).toFixed(1)}%
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'hsl(215, 20%, 65%)' }}>Overall Profit Margin</p>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', backgroundColor: 'hsl(220, 25%, 10%)', color: 'white', border: 'none' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <PieChart size={18} /> Cost Breakdown
                        </h4>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                                <span style={{ color: 'hsl(215, 20%, 75%)' }}>Fuel Expenses</span>
                                <span style={{ fontWeight: 600 }}>₹{data?.vehicleROI.reduce((a, b) => a + parseFloat(b.fuel_cost), 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                                <span style={{ color: 'hsl(215, 20%, 75%)' }}>Maintenance</span>
                                <span style={{ fontWeight: 600 }}>₹{data?.vehicleROI.reduce((a, b) => a + parseFloat(b.maint_cost), 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Trend List */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={20} /> Historical Revenue Growth
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
                    {data?.monthlyTrend.map((m, idx) => (
                        <div key={idx} style={{ textAlign: 'center' }}>
                            <div style={{
                                height: '120px',
                                backgroundColor: 'hsla(var(--primary), 0.05)',
                                borderRadius: '8px',
                                position: 'relative',
                                marginBottom: '0.75rem',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center'
                            }}>
                                <div style={{
                                    height: `${(m.revenue / Math.max(...data.monthlyTrend.map(x => x.revenue))) * 100}%`,
                                    width: '60%',
                                    backgroundColor: 'hsl(var(--primary))',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 1s ease-out'
                                }} />
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{m.month}</div>
                            <div style={{ fontSize: '0.7rem', color: 'hsl(215, 20%, 50%)' }}>₹{parseFloat(m.revenue).toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OperationalAnalytics;
