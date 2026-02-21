const db = require('../db');
const { Parser } = require('json2csv');

const getOperationalAnalytics = async (req, res) => {
    try {
        // 1. ROI per Vehicle (Revenue vs Maintenance vs Fuel)
        const vehicleROI = await db.query(`
      SELECT 
        v.id,
        v.plate_number,
        v.model,
        COALESCE(SUM(DISTINCT t.revenue), 0) as total_revenue,
        COALESCE((SELECT SUM(cost) FROM maintenance_logs WHERE vehicle_id = v.id), 0) as maint_cost,
        COALESCE((SELECT SUM(cost) FROM fuel_logs WHERE vehicle_id = v.id), 0) as fuel_cost
      FROM vehicles v
      LEFT JOIN trips t ON v.id = t.vehicle_id AND t.status = 'Completed'
      GROUP BY v.id
      ORDER BY total_revenue DESC
    `);

        // 2. Monthly Trend (Last 6 months)
        const monthlyTrend = await db.query(`
      SELECT 
        TO_CHAR(completion_date, 'Mon YYYY') as month,
        SUM(revenue) as revenue,
        DATE_TRUNC('month', completion_date) as sort_date
      FROM trips
      WHERE status = 'Completed' AND completion_date > CURRENT_DATE - INTERVAL '6 months'
      GROUP BY 1, 3
      ORDER BY 3 ASC
    `);

        res.json({
            vehicleROI: vehicleROI.rows.map(r => ({
                ...r,
                total_cost: parseFloat(r.maint_cost) + parseFloat(r.fuel_cost),
                net_profit: parseFloat(r.total_revenue) - (parseFloat(r.maint_cost) + parseFloat(r.fuel_cost))
            })),
            monthlyTrend: monthlyTrend.rows
        });

    } catch (err) {
        console.error('ANALYTICS ERROR:', err);
        res.status(500).json({ error: 'Server error while generating analytics' });
    }
};

const exportCSV = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT 
                v.plate_number, 
                v.model, 
                t.cargo_weight_kg, 
                t.revenue, 
                t.dispatch_date, 
                t.completion_date,
                d.full_name as driver_name
            FROM trips t
            JOIN vehicles v ON t.vehicle_id = v.id
            JOIN drivers d ON t.driver_id = d.id
            WHERE t.status = 'Completed'
        `);

        const fields = ['plate_number', 'model', 'cargo_weight_kg', 'revenue', 'dispatch_date', 'completion_date', 'driver_name'];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(rows);

        res.header('Content-Type', 'text/csv');
        res.attachment('fleet_operations_report.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).json({ error: 'CSV Export Failed' });
    }
};

module.exports = {
    getOperationalAnalytics,
    exportCSV
};
