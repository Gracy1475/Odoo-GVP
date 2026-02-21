"use client";

import { FormEvent, useMemo, useState } from "react";
import { seedDrivers, seedTrips, seedVehicles, validateTripAssignment } from "@/lib/fleet-data";
import { Driver, Trip, Vehicle } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { VehicleRecommendationCard } from "@/components/status";
import { recommendVehicleForCargo } from "@/utils/smart-dispatch";
import { DetailDrawer, DrawerHistory, DrawerMetrics, DrawerSummary, DrawerTimeline } from "@/components/drawer";

interface TripFormState {
  vehicleId: number;
  cargoWeight: number;
  driverId: number;
  originAddress: string;
  destination: string;
  estimatedFuelCost: number;
}

export default function DispatcherPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [drivers] = useState<Driver[]>(seedDrivers);
  const [trips, setTrips] = useState<Trip[]>(seedTrips);
  const [showNewTripForm, setShowNewTripForm] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [form, setForm] = useState<TripFormState>({
    vehicleId: 0,
    cargoWeight: 1000,
    driverId: 0,
    originAddress: "",
    destination: "",
    estimatedFuelCost: 0,
  });

  // Search, filter, sort, group state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [groupBy, setGroupBy] = useState<"None" | "Status" | "Vehicle">("None");
  const [filterStatus, setFilterStatus] = useState<"All" | "Draft" | "Dispatched" | "In Transit" | "Completed">("All");
  const [sortBy, setSortBy] = useState<"Latest" | "Vehicle" | "Driver" | "Status">("Latest");

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === "Available"),
    [vehicles],
  );

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === form.vehicleId);
  const selectedDriver = drivers.find((driver) => driver.id === form.driverId);
  const activeTripVehicle = activeTrip ? vehicles.find((vehicle) => vehicle.id === activeTrip.vehicleId) : null;
  const activeTripDriver = activeTrip ? drivers.find((driver) => driver.id === activeTrip.driverId) : null;

  const assignmentValidation = validateTripAssignment({
    cargoWeight: form.cargoWeight,
    vehicle: selectedVehicle,
    driver: selectedDriver,
  });

  // Memoized visible rows with search, filter, sort, group
  const visibleRows = useMemo(() => {
    const filtered = trips.filter((trip) => {
      // Search
      const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
      const driver = drivers.find((d) => d.id === trip.driverId);
      const matchesSearch =
        !searchTerm ||
        trip.id.toString().includes(searchTerm.toLowerCase()) ||
        vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by status
      const matchesFilter = filterStatus === "All" || trip.status === filterStatus;

      return matchesSearch && matchesFilter;
    });

    // Sort
    if (sortBy === "Latest") {
      filtered.sort((a, b) => b.id - a.id);
    } else if (sortBy === "Vehicle") {
      filtered.sort((a, b) => {
        const vA = vehicles.find((v) => v.id === a.vehicleId)?.model || "";
        const vB = vehicles.find((v) => v.id === b.vehicleId)?.model || "";
        return vA.localeCompare(vB);
      });
    } else if (sortBy === "Driver") {
      filtered.sort((a, b) => {
        const dA = drivers.find((d) => d.id === a.driverId)?.name || "";
        const dB = drivers.find((d) => d.id === b.driverId)?.name || "";
        return dA.localeCompare(dB);
      });
    } else if (sortBy === "Status") {
      filtered.sort((a, b) => a.status.localeCompare(b.status));
    }

    // Group (return flat array but visually grouped in render)
    return filtered;
  }, [trips, searchTerm, filterStatus, sortBy, vehicles, drivers]);

  const handleFormChange = (field: keyof TripFormState, value: unknown) => {
    if (field === "cargoWeight" || field === "estimatedFuelCost") {
      setForm((prev) => ({ ...prev, [field]: Number(value) }));
    } else if (field === "vehicleId" || field === "driverId") {
      setForm((prev) => ({ ...prev, [field]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [field]: String(value) }));
    }
  };

  const addTrip = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.vehicleId || !form.driverId || !form.originAddress || !form.destination) {
      setMessage("Please fill all required fields.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (assignmentValidation) {
      setMessage(`Validation Error: ${assignmentValidation}`);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const newTrip: Trip = {
      id: Date.now(),
      vehicleId: form.vehicleId,
      driverId: form.driverId,
      cargoWeight: form.cargoWeight,
      origin: form.originAddress,
      destination: form.destination,
      revenue: 5400,
      status: "Dispatched",
      startOdometer: selectedVehicle?.odometer ?? 0,
      endOdometer: selectedVehicle ? selectedVehicle.odometer + 260 : 0,
    };

    setTrips((prev) => [newTrip, ...prev]);
    setVehicles((prev) =>
      prev.map((vehicle) => (vehicle.id === form.vehicleId ? { ...vehicle, status: "On Trip" } : vehicle)),
    );

    // Reset form and close
    setForm({
      vehicleId: 0,
      cargoWeight: 1000,
      driverId: 0,
      originAddress: "",
      destination: "",
      estimatedFuelCost: 0,
    });
    setShowNewTripForm(false);
    setMessage("Trip dispatched successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const cancelNewTrip = () => {
    setForm({
      vehicleId: 0,
      cargoWeight: 1000,
      driverId: 0,
      originAddress: "",
      destination: "",
      estimatedFuelCost: 0,
    });
    setShowNewTripForm(false);
    setMessage("");
  };

  return (
    <section className="space-y-3">
      <div className="wire-titlebar rounded-md border border-slate-700">
        <h1 className="wire-page-title">Trip Dispatcher & Management</h1>
      </div>

      {/* Trips Table Panel */}
      <div className="wire-window overflow-hidden">
        <div className="wire-toolbar">
          <input
            className="wire-input min-w-[220px]"
            placeholder="Search trips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="wire-select w-32"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as "None" | "Status" | "Vehicle")}
          >
            <option value="None">Group: None</option>
            <option value="Status">Group: Status</option>
            <option value="Vehicle">Group: Vehicle</option>
          </select>
          <select
            className="wire-select w-32"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "All" | "Draft" | "Dispatched" | "In Transit" | "Completed")}
          >
            <option value="All">Filter: All</option>
            <option value="Draft">Filter: Draft</option>
            <option value="Dispatched">Filter: Dispatched</option>
            <option value="In Transit">Filter: In Transit</option>
            <option value="Completed">Filter: Completed</option>
          </select>
          <select
            className="wire-select w-32"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "Latest" | "Vehicle" | "Driver" | "Status")}
          >
            <option value="Latest">Sort: Latest</option>
            <option value="Vehicle">Sort: Vehicle</option>
            <option value="Driver">Sort: Driver</option>
            <option value="Status">Sort: Status</option>
          </select>
          <button onClick={() => setShowNewTripForm(true)} className="wire-button">
            + New Trip
          </button>
        </div>

        {/* Trip Table */}
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Trip Fleet Type</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Origin</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Destination</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length > 0 ? (
              visibleRows.map((trip) => {
                const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
                const tripStatusMap: Record<string, "pending" | "active" | "completed" | "cancelled"> = {
                  "Draft": "pending",
                  "Dispatched": "active",
                  "In Transit": "active",
                  "Completed": "completed",
                };
                return (
                  <tr
                    key={trip.id}
                    className="wire-table-row-hover border-b border-slate-800 cursor-pointer"
                    onClick={() => setActiveTrip(trip)}
                  >
                    <td className="px-3 py-2 text-slate-200">{vehicle?.type || "Unknown"}</td>
                    <td className="px-3 py-2 text-slate-300">{trip.origin || "—"}</td>
                    <td className="px-3 py-2 text-slate-300">{trip.destination || "—"}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={tripStatusMap[trip.status] || "pending"} label={trip.status} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                  No trips found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Trip Form Panel */}
      {showNewTripForm && (
        <div className="wire-window space-y-3 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-100">New Trip Form</p>
            <button
              onClick={cancelNewTrip}
              className="text-slate-400 hover:text-slate-200 transition-colors text-xl leading-none"
            >
              ✕
            </button>
          </div>

          <form onSubmit={addTrip} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Vehicle <span className="text-rose-400">*</span>
                </label>
                <select
                  value={form.vehicleId}
                  onChange={(e) => handleFormChange("vehicleId", e.target.value)}
                  className="wire-select w-full"
                  required
                >
                  <option value={0}>Choose vehicle...</option>
                  {availableVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} ({vehicle.licensePlate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cargo Weight (kg) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.cargoWeight}
                  onChange={(e) => handleFormChange("cargoWeight", e.target.value)}
                  className="wire-input w-full"
                  placeholder="Enter weight in kg"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Smart Vehicle Recommendation */}
            {form.cargoWeight > 0 && availableVehicles.length > 0 && (
              <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/30">
                <h3 className="text-sm font-semibold text-cyan-300 mb-3">🚗 Recommended Vehicles</h3>
                <div className="space-y-2">
                  {availableVehicles
                    .filter((v) => v.maxCapacity >= form.cargoWeight)
                    .slice(0, 3)
                    .map((vehicle) => {
                      const recommendation = recommendVehicleForCargo(form.cargoWeight, [vehicle]);
                      return recommendation ? (
                        <VehicleRecommendationCard
                          key={vehicle.id}
                          recommendation={recommendation}
                          isSelected={form.vehicleId === vehicle.id}
                          onSelect={() => handleFormChange("vehicleId", vehicle.id.toString())}
                        />
                      ) : null;
                    })}
                </div>
                {availableVehicles.filter((v) => v.maxCapacity >= form.cargoWeight).length === 0 && (
                  <p className="text-xs text-amber-300">⚠️ No available vehicles can accommodate this cargo weight</p>
                )}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Driver <span className="text-rose-400">*</span>
                </label>
                <select
                  value={form.driverId}
                  onChange={(e) => handleFormChange("driverId", e.target.value)}
                  className="wire-select w-full"
                  required
                >
                  <option value={0}>Choose driver...</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Estimated Fuel Cost ($) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.estimatedFuelCost}
                  onChange={(e) => handleFormChange("estimatedFuelCost", e.target.value)}
                  className="wire-input w-full"
                  placeholder="Enter estimated cost"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Origin Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.originAddress}
                  onChange={(e) => handleFormChange("originAddress", e.target.value)}
                  className="wire-input w-full"
                  placeholder="Enter origin address"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.destination}
                  onChange={(e) => handleFormChange("destination", e.target.value)}
                  className="wire-input w-full"
                  placeholder="Enter destination address"
                  required
                />
              </div>
            </div>

            {/* Validation Message */}
            {assignmentValidation && (
              <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800 rounded px-2 py-1">
                {assignmentValidation}
              </div>
            )}

            {/* Success/Error Message */}
            {message && (
              <div className="text-xs text-cyan-300 bg-cyan-950/30 border border-cyan-800 rounded px-2 py-1">
                {message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button type="submit" className="wire-button flex-1">
                Confirm & Dispatch Trip
              </button>
              <button type="button" onClick={cancelNewTrip} className="wire-button-alt flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <DetailDrawer
        isOpen={Boolean(activeTrip)}
        onClose={() => setActiveTrip(null)}
        title={activeTrip ? `Trip #${activeTrip.id}` : "Trip Details"}
        subtitle="Dispatch Detail"
      >
        {activeTrip && (
          <>
            <DrawerSummary
              items={[
                { label: "Trip ID", value: String(activeTrip.id) },
                { label: "Vehicle", value: activeTripVehicle ? `${activeTripVehicle.model} (${activeTripVehicle.licensePlate})` : "Unknown" },
                { label: "Driver", value: activeTripDriver?.name ?? "Unknown" },
                { label: "Status", value: activeTrip.status },
              ]}
            />

            <DrawerMetrics
              items={[
                { label: "Cargo", value: `${activeTrip.cargoWeight.toLocaleString()} kg` },
                { label: "Revenue", value: `$${activeTrip.revenue.toLocaleString()}` },
                { label: "Distance", value: `${Math.max(0, activeTrip.endOdometer - activeTrip.startOdometer)} km` },
                { label: "Vehicle State", value: activeTripVehicle?.status ?? "Unknown", tone: activeTripVehicle?.status === "On Trip" ? "warning" : "default" },
              ]}
            />

            <DrawerHistory
              title="Historical Data"
              rows={[
                `Origin: ${activeTrip.origin ?? "Unknown"}`,
                `Destination: ${activeTrip.destination ?? "Unknown"}`,
                `Driver assignment: ${activeTripDriver?.name ?? "Unknown"}`,
              ]}
            />

            <DrawerTimeline
              items={[
                { date: "Created", label: "Trip drafted", status: "Draft" },
                { date: "Dispatch", label: "Trip dispatched", status: activeTrip.status === "Draft" ? "Pending" : "Completed" },
                { date: "Completion", label: "Trip closeout", status: activeTrip.status === "Completed" ? "Completed" : "Pending" },
              ]}
            />
          </>
        )}
      </DetailDrawer>
    </section>
  );
}
