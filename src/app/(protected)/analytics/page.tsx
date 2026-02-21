"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/context/toast-context";
import {
  calculateFuelEfficiency,
  calculateROI,
  seedExpenseLogs,
  seedFuelLogs,
  seedServiceLogs,
  seedTrips,
  seedVehicles,
} from "@/lib/fleet-data";
import { AnalyticsMetric, DateRangeSelector, ExportPanel } from "@/components/status";
import { Tooltip } from "@/components/common";
import { formatCurrency } from "@/utils/formatting";

interface VehicleMetrics {
  model: string;
  fuelCost: number;
  maintenanceCost: number;
  fuelEfficiency: number;
  distance: number;
}

interface FinancialMonth {
  month: string;
  revenue: number;
  fuelCost: number;
  maintenanceCost: number;
  netProfit: number;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<"month" | "quarter" | "year" | "custom">("month");
  const { addToast } = useToast();

  const vehicleMetrics = useMemo((): VehicleMetrics[] => {
    return seedVehicles
      .filter((vehicle) => vehicle.status !== "Retired")
      .map((vehicle) => {
        const trips = seedTrips.filter((trip) => trip.vehicleId === vehicle.id);
        const fuelLogs = seedFuelLogs.filter((fuelLog) => fuelLog.vehicleId === vehicle.id);
        const maintenanceLogs = seedServiceLogs.filter((serviceLog) => serviceLog.vehicleId === vehicle.id);

        const distance = trips.reduce((sum, trip) => sum + Math.max(0, trip.endOdometer - trip.startOdometer), 0);
        const liters = fuelLogs.reduce((sum, fuelLog) => sum + fuelLog.liters, 0);
        const fuelCost = fuelLogs.reduce((sum, fuelLog) => sum + fuelLog.cost, 0);
        const maintenanceCost = maintenanceLogs.reduce((sum, serviceLog) => sum + serviceLog.cost, 0);
        const fuelEfficiency = calculateFuelEfficiency(distance, liters);

        return {
          model: vehicle.model,
          fuelCost,
          maintenanceCost,
          fuelEfficiency,
          distance,
        };
      });
  }, []);

  const financialMetrics = useMemo(() => {
    const totalRevenue = seedTrips.reduce((sum, trip) => sum + trip.revenue, 0);
    const totalFuelCost = seedFuelLogs.reduce((sum, log) => sum + log.cost, 0);
    const totalMaintenanceCost = seedServiceLogs.reduce((sum, log) => sum + log.cost, 0);
    const totalExpensesCost = seedExpenseLogs.reduce((sum, log) => sum + log.fuelCost + log.miscExpense, 0);
    const netProfit = totalRevenue - totalFuelCost - totalMaintenanceCost - totalExpensesCost;

    const nonRetiredVehicles = seedVehicles.filter((v) => v.status !== "Retired");
    const onTripVehicles = nonRetiredVehicles.filter((v) => v.status === "On Trip");
    const utilizationRate = nonRetiredVehicles.length > 0 ? (onTripVehicles.length / nonRetiredVehicles.length) * 100 : 0;

    const roiSum = vehicleMetrics.reduce((sum, v) => {
      const roi = calculateROI(v.distance * 5.4, v.maintenanceCost, v.fuelCost, 150000);
      return sum + roi;
    }, 0);
    const avgROI = vehicleMetrics.length > 0 ? (roiSum / vehicleMetrics.length) * 100 : 0;

    return {
      revenue: totalRevenue,
      fuelCost: totalFuelCost,
      maintenanceCost: totalMaintenanceCost,
      expensesCost: totalExpensesCost,
      netProfit,
      utilizationRate,
      avgROI,
    };
  }, [vehicleMetrics]);

  const top5CostliestVehicles = useMemo(() => {
    return [...vehicleMetrics]
      .sort((a, b) => b.fuelCost + b.maintenanceCost - (a.fuelCost + a.maintenanceCost))
      .slice(0, 5);
  }, [vehicleMetrics]);

  // Simulated monthly data
  const monthlyData: FinancialMonth[] = [
    { month: "Jan", revenue: 18000, fuelCost: 6000, maintenanceCost: 2000, netProfit: 10000 },
    { month: "Feb", revenue: 21000, fuelCost: 6500, maintenanceCost: 2100, netProfit: 12400 },
  ];

  // Simulated fuel efficiency trend
  const fuelTrendData = [
    { month: "Jan", efficiency: 4.2 },
    { month: "Dec", efficiency: 4.8 },
    { month: "Jan", efficiency: 4.5 },
    { month: "Feb", efficiency: 5.1 },
  ];

  // Format large numbers to Rs. format
  const formatCurrency = (value: number): string => {
    if (value >= 100000) {
      return `Rs. ${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `Rs. ${(value / 1000).toFixed(1)}k`;
    }
    return `Rs. ${value.toFixed(0)}`;
  };

  return (
    <section className="space-y-3">
      <div className="wire-titlebar rounded-md border border-slate-700">
        <h1 className="wire-page-title">Operational Analytics & Financial Reports</h1>
      </div>

      {/* Date Range Selector & Export */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="wire-window p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">📅 Date Range</h3>
          <DateRangeSelector onRangeChange={setDateRange} defaultRange={dateRange} />
        </div>
        <div className="wire-window p-4">
          <ExportPanel
            title="Download Reports"
            onExportCSV={() => {
              // Generate CSV export
              const csv = "Month,Revenue,Fuel Cost,Maintenance,Net Profit\n" +
                monthlyData.map(m => `${m.month},${m.revenue},${m.fuelCost},${m.maintenanceCost},${m.netProfit}`).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "fleet-analytics.csv";
              a.click();
            }}
            onExportPDF={() => {
              console.log("PDF export triggered");
            }}
            onExportSuccess={(type) => {
              addToast("success", `${type} downloaded successfully`, 3000);
            }}
            onExportError={(type, error) => {
              addToast("error", `Failed to export ${type}`, 3000);
            }}
          />
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsMetric
          label="Total Fuel Cost"
          value={formatCurrency(financialMetrics.fuelCost)}
          icon="⛽"
          change={{ value: 8, trend: "up" }}
          tooltip="Total fuel expenses across all vehicles"
        />
        <AnalyticsMetric
          label="Fleet ROI"
          value={`+${financialMetrics.avgROI.toFixed(1)}%`}
          icon="📈"
          change={{ value: 12, trend: "up" }}
          variant="success"
          tooltip="Return on investment from all fleet operations"
        />
        <AnalyticsMetric
          label="Utilization Rate"
          value={`${financialMetrics.utilizationRate.toFixed(0)}%`}
          icon="🎯"
          change={{ value: 5, trend: "down" }}
          tooltip="Percentage of active vs idle vehicles"
        />
        <AnalyticsMetric
          label="Cost Per KM"
          value={`${((financialMetrics.fuelCost + financialMetrics.maintenanceCost) / 5000).toFixed(2)}`}
          unit="Rs/km"
          icon="🛣️"
          change={{ value: 3, trend: "up" }}
          tooltip="Cost efficiency per kilometer traveled"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Fuel Efficiency Trend Chart */}
        <div className="wire-window p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Fuel Efficiency Trend (km/L)</h3>
          <div className="bg-slate-100/5 border border-slate-800 rounded p-3 overflow-x-auto">
            <svg width="100%" height="180" viewBox="0 0 280 180" className="min-w-[260px]">
              {/* Grid */}
              <line x1="30" y1="10" x2="30" y2="140" stroke="#475569" strokeWidth="1" />
              <line x1="30" y1="140" x2="270" y2="140" stroke="#475569" strokeWidth="1" />

              {/* Axis labels */}
              <text x="35" y="155" fontSize="12" fill="#94a3b8">
                Jan
              </text>
              <text x="90" y="155" fontSize="12" fill="#94a3b8">
                Dec
              </text>
              <text x="150" y="155" fontSize="12" fill="#94a3b8">
                Jan
              </text>
              <text x="210" y="155" fontSize="12" fill="#94a3b8">
                Feb
              </text>

              {/* Data points and line */}
              <polyline
                points="50,110 110,80 170,95 230,40"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
              />
              <circle cx="50" cy="110" r="4" fill="#22d3ee" />
              <circle cx="110" cy="80" r="4" fill="#22d3ee" />
              <circle cx="170" cy="95" r="4" fill="#22d3ee" />
              <circle cx="230" cy="40" r="4" fill="#22d3ee" />

              {/* Y-axis values */}
              <text x="5" y="145" fontSize="11" fill="#94a3b8">
                0
              </text>
              <text x="5" y="85" fontSize="11" fill="#94a3b8">
                3
              </text>
              <text x="5" y="25" fontSize="11" fill="#94a3b8">
                6
              </text>
            </svg>
          </div>
        </div>

        {/* Top 5 Costliest Vehicles Chart */}
        <div className="wire-window p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Top 5 Costliest Vehicles</h3>
          <div className="bg-slate-100/5 border border-slate-800 rounded p-3 overflow-x-auto">
            <svg width="100%" height="180" viewBox="0 0 280 180" className="min-w-[260px]">
              {/* Grid */}
              <line x1="30" y1="10" x2="30" y2="140" stroke="#475569" strokeWidth="1" />
              <line x1="30" y1="140" x2="270" y2="140" stroke="#475569" strokeWidth="1" />

              {/* Bars */}
              {top5CostliestVehicles.map((vehicle, idx) => {
                const maxCost = Math.max(...top5CostliestVehicles.map((v) => v.fuelCost + v.maintenanceCost));
                const cost = vehicle.fuelCost + vehicle.maintenanceCost;
                const barHeight = (cost / maxCost) * 110;
                const x = 50 + idx * 45;
                return (
                  <g key={idx}>
                    <rect x={x - 10} y={140 - barHeight} width="20" height={barHeight} fill="#22d3ee" />
                    <text x={x - 8} y="158" fontSize="11" fill="#94a3b8">
                      V{idx + 1}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis values */}
              <text x="5" y="145" fontSize="11" fill="#94a3b8">
                0
              </text>
              <text x="5" y="85" fontSize="11" fill="#94a3b8">
                5k
              </text>
              <text x="5" y="25" fontSize="11" fill="#94a3b8">
                10k
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Top 3 Underperforming Vehicles */}
      <div className="wire-window p-4 border-red-700/50">
        <h3 className="text-sm font-semibold text-red-300 mb-3">🔴 Top 3 Underperforming Vehicles</h3>
        <div className="space-y-2">
          {seedVehicles
            .filter((v) => v.status !== "Retired")
            .slice(0, 3)
            .map((vehicle) => {
              const trips = seedTrips.filter((t) => t.vehicleId === vehicle.id);
              const maintenanceLogs = seedServiceLogs.filter((s) => s.vehicleId === vehicle.id);
              const totalCost = maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
              const costPerTrip = trips.length > 0 ? totalCost / trips.length : 0;
              return (
                <div key={vehicle.id} className="p-3 rounded border-l-4 border-l-red-500 bg-red-900/20 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{vehicle.model}</p>
                    <p className="text-xs text-slate-400">Trips: {trips.length} | Avg Cost/Trip: ${costPerTrip.toFixed(2)}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-red-900/40 text-red-300">⚠️ Monitor</span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Financial Summary Table */}
      <div className="wire-window overflow-hidden">
        <h3 className="text-sm font-semibold text-slate-300 px-4 pt-4 pb-2">Financial Summary of Month</h3>
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Month</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Revenue</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Fuel Cost</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Maintenance</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((month) => (
              <tr key={month.month} className="border-b border-slate-800 hover:bg-slate-900/30 transition-colors">
                <td className="px-3 py-2 text-slate-200 font-semibold">{month.month}</td>
                <td className="px-3 py-2 text-slate-300">{formatCurrency(month.revenue)}</td>
                <td className="px-3 py-2 text-slate-300">{formatCurrency(month.fuelCost)}</td>
                <td className="px-3 py-2 text-slate-300">{formatCurrency(month.maintenanceCost)}</td>
                <td className="px-3 py-2 text-emerald-300 font-semibold">{formatCurrency(month.netProfit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
