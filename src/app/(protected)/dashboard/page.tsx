"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { KpiCard } from "@/components/kpi-card";
import { seedDrivers, seedTrips, seedVehicles } from "@/lib/fleet-data";
import { Trip, TripStatus, Vehicle } from "@/lib/types";
import { FleetHealthCard } from "@/components/fleet-health-card";
import { getNonCompliantDrivers } from "@/utils/driver-compliance";

type TripRow = {
  tripId: number;
  vehicle: string;
  driver: string;
  status: TripStatus;
};

export default function DashboardPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [trips] = useState<Trip[]>(seedTrips);
  const [refreshedAt, setRefreshedAt] = useState(new Date());
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<"none" | "status" | "driver">("none");
  const [statusFilter, setStatusFilter] = useState<"All" | TripStatus>("All");
  const [sortBy, setSortBy] = useState<"latest" | "vehicle" | "driver" | "status">("latest");
  const [info, setInfo] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setRefreshedAt(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const metrics = useMemo(() => {
    const nonRetired = vehicles.filter((vehicle) => vehicle.status !== "Retired");
    const onTrip = vehicles.filter((vehicle) => vehicle.status === "On Trip");
    const inShop = vehicles.filter((vehicle) => vehicle.status === "In Shop");
    const pendingCargo = trips.filter((trip) => trip.status === "Draft").length;
    const utilization = nonRetired.length === 0 ? 0 : (onTrip.length / nonRetired.length) * 100;
    const complianceRate = (() => {
      const nonCompliantCount = getNonCompliantDrivers(seedDrivers).length;
      if (seedDrivers.length === 0) return 100;
      return ((seedDrivers.length - nonCompliantCount) / seedDrivers.length) * 100;
    })();

    const maintenanceHealth = nonRetired.length === 0 ? 100 : ((nonRetired.length - inShop.length) / nonRetired.length) * 100;

    const roi = (() => {
      const totalRevenue = trips.reduce((sum, trip) => sum + trip.revenue, 0);
      const totalAcquisition = nonRetired.reduce((sum, vehicle) => sum + vehicle.acquisitionCost, 0);
      if (totalAcquisition <= 0) return 0;
      return Math.min(100, Math.max(0, (totalRevenue / totalAcquisition) * 100 * 10));
    })();

    const fleetHealthScore =
      utilization * 0.3 +
      complianceRate * 0.25 +
      maintenanceHealth * 0.25 +
      roi * 0.2;

    return {
      activeFleet: onTrip.length,
      maintenanceAlerts: inShop.length,
      pendingCargo,
      utilization,
      fleetHealthScore,
    };
  }, [trips, vehicles]);

  const tripRows = useMemo<TripRow[]>(() => {
    const rows = trips.map((trip) => {
      const vehicle = vehicles.find((entry) => entry.id === trip.vehicleId);
      const driver = seedDrivers.find((entry) => entry.id === trip.driverId);
      return {
        tripId: trip.id,
        vehicle: vehicle ? `${vehicle.model} (${vehicle.licensePlate})` : `Vehicle #${trip.vehicleId}`,
        driver: driver?.name ?? `Driver #${trip.driverId}`,
        status: trip.status,
      };
    });

    const searchTerm = search.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const matchesSearch =
        !searchTerm ||
        row.vehicle.toLowerCase().includes(searchTerm) ||
        row.driver.toLowerCase().includes(searchTerm) ||
        row.status.toLowerCase().includes(searchTerm) ||
        String(row.tripId).includes(searchTerm);
      const matchesStatus = statusFilter === "All" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (groupBy === "status" && a.status !== b.status) {
        return a.status.localeCompare(b.status);
      }
      if (groupBy === "driver" && a.driver !== b.driver) {
        return a.driver.localeCompare(b.driver);
      }

      switch (sortBy) {
        case "vehicle":
          return a.vehicle.localeCompare(b.vehicle);
        case "driver":
          return a.driver.localeCompare(b.driver);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return b.tripId - a.tripId;
      }
    });

    return sorted;
  }, [groupBy, search, sortBy, statusFilter, trips, vehicles]);

  const addVehicle = () => {
    const nextId = Math.max(...vehicles.map((vehicle) => vehicle.id)) + 1;
    const plateSuffix = String(nextId).padStart(3, "0");
    const newVehicle: Vehicle = {
      id: nextId,
      model: `FleetFlow Neo ${nextId}`,
      licensePlate: `FF-NEW-${plateSuffix}`,
      maxCapacity: 18000,
      odometer: 0,
      acquisitionCost: 105000,
      status: "Available",
      region: "North",
      type: "Truck",
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    setInfo(`Vehicle ${newVehicle.licensePlate} added.`);
  };

  const addTrip = () => {
    const candidateVehicle = vehicles.find((vehicle) => vehicle.status === "Available");
    const candidateDriver = seedDrivers.find((driver) => driver.status === "On Duty");

    if (!candidateVehicle || !candidateDriver) {
      setInfo("No available vehicle or on-duty driver found.");
      return;
    }

    router.push("/dispatcher");
  };

  return (
    <section className="space-y-3">
      <div className="wire-window overflow-hidden">
        <div className="wire-titlebar">
          <h1 className="wire-page-title">Main Dashboard</h1>
          <p className="text-[11px] text-slate-400">Auto-refresh: {refreshedAt.toLocaleTimeString()}</p>
        </div>
        <div className="wire-toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="wire-input min-w-[230px]"
            placeholder="Search bar..."
          />
          <select
            value={groupBy}
            onChange={(event) => setGroupBy(event.target.value as typeof groupBy)}
            className="wire-select"
          >
            <option value="none">Group by: None</option>
            <option value="status">Group by: Status</option>
            <option value="driver">Group by: Driver</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="wire-select"
          >
            <option value="All">Filter: All Status</option>
            <option value="Draft">Draft</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
            className="wire-select"
          >
            <option value="latest">Sort by: Latest</option>
            <option value="vehicle">Sort by: Vehicle</option>
            <option value="driver">Sort by: Driver</option>
            <option value="status">Sort by: Status</option>
          </select>
        </div>

        <div className="flex flex-wrap justify-end gap-2 px-3 py-2">
          <button onClick={addTrip} className="wire-button-alt">
            New Trip
          </button>
          <button onClick={addVehicle} className="wire-button">
            New Vehicle
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 px-3 pb-3 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard title="Active Fleet" value={String(metrics.activeFleet)} accent="text-cyan-300" />
          <KpiCard title="Maintenance Alert" value={String(metrics.maintenanceAlerts)} accent="text-violet-300" />
          <KpiCard title="Pending Cargo" value={String(metrics.pendingCargo)} accent="text-amber-300" />
          <KpiCard title="Utilization" value={`${metrics.utilization.toFixed(1)}%`} accent="text-emerald-300" />
          <FleetHealthCard score={metrics.fleetHealthScore} />
        </div>

        {info && <p className="px-3 pb-2 text-xs text-cyan-300">{info}</p>}

        <div className="px-3 pb-3">
          <DataTable
            rows={tripRows}
            columns={[
              { key: "trip", header: "Trip", render: (row) => row.tripId },
              { key: "vehicle", header: "Vehicle", render: (row) => row.vehicle },
              { key: "driver", header: "Driver", render: (row) => row.driver },
              {
                key: "status",
                header: "Status",
                render: (row) =>
                  row.status === "Dispatched" ? (
                    <span className="font-semibold text-amber-300">On Trip</span>
                  ) : (
                    row.status
                  ),
              },
            ]}
            emptyText="No trips found for current filter."
          />
        </div>
      </div>
    </section>
  );
}
