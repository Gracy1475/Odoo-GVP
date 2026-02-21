const db = require('../db');

const getDashboardStats = async (req, res) => {
    try {
        // 1. Fleet Stats
        const vehicleStats = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Available') as available,
        COUNT(*) FILTER (WHERE status = 'On Trip') as on_trip,
        COUNT(*) FILTER (WHERE status = 'In Shop') as in_shop
      FROM vehicles
    `);

        // 2. Operational Stats (Active Trips)
        const activeTrips = await db.query(`
      SELECT COUNT(*) as count FROM trips WHERE status = 'Dispatched'
    `);

        // 3. Financial Stats (Revenue vs Expenses)
        // Revenue from completed trips
        const revenueRes = await db.query(`
      SELECT SUM(revenue) as total_revenue FROM trips WHERE status = 'Completed'
    `);

        // Expenses (Maintenance + Fuel)
        const maintenanceExp = await db.query(`SELECT SUM(cost) as total FROM maintenance_logs`);
        const fuelExp = await db.query(`SELECT SUM(cost) as total FROM fuel_logs`);

        const totalExpenses = (parseFloat(maintenanceExp.rows[0].total) || 0) + (parseFloat(fuelExp.rows[0].total) || 0);
        const totalRevenue = parseFloat(revenueRes.rows[0].total_revenue) || 0;

        // 4. Recent Activity (Last 5 trips)
        const recentActivity = await db.query(`
      SELECT t.id, t.status, v.plate_number, d.full_name as driver_name, t.dispatch_date as date
      FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN drivers d ON t.driver_id = d.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `);

        res.json({
            fleet: vehicleStats.rows[0],
            activeTrips: activeTrips.rows[0].count,
            finance: {
                revenue: totalRevenue,
                expenses: totalExpenses,
                profit: totalRevenue - totalExpenses
            },
            recentActivity: recentActivity.rows[0] ? recentActivity.rows : []
        });

    } catch (err) {
        console.error('DASHBOARD STATS ERROR:', err);
        res.status(500).json({ error: 'Server error while fetching dashboard statistics' });
    }
};

module.exports = {
    getDashboardStats
};
