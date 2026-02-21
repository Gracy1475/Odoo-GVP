"use client";

import { FormEvent, useMemo, useState } from "react";
import { seedVehicles } from "@/lib/fleet-data";
import { Vehicle } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { VehiclePerformanceBadge } from "@/components/status";
import { calculateVehiclePerformance } from "@/utils/vehicle-intelligence";
import { seedTrips, seedServiceLogs } from "@/lib/fleet-data";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { IconActionButton } from "@/components/common";
import { DetailDrawer, DrawerHistory, DrawerMetrics, DrawerSummary, DrawerTimeline } from "@/components/drawer";

type FormState = {
  licensePlate: string;
  maxPayloadTon: string;
  initialOdometer: string;
  type: string;
  model: string;
};

const initialForm: FormState = {
  licensePlate: "",
  maxPayloadTon: "",
  initialOdometer: "",
  type: "Truck",
  model: "",
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [vehiclePendingDelete, setVehiclePendingDelete] = useState<Vehicle | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [openMenuVehicleId, setOpenMenuVehicleId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState<"none" | "type" | "status">("none");
  const [statusFilter, setStatusFilter] = useState<"All" | Vehicle["status"]>("All");
  const [sortBy, setSortBy] = useState<"latest" | "plate" | "model" | "odometer">("latest");

  const visibleRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = vehicles.filter((vehicle) => {
      const matchTerm =
        !term ||
        vehicle.licensePlate.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term) ||
        vehicle.type.toLowerCase().includes(term);
      const matchStatus = statusFilter === "All" || vehicle.status === statusFilter;
      return matchTerm && matchStatus;
    });

    return [...filtered].sort((a, b) => {
      if (groupBy === "type" && a.type !== b.type) return a.type.localeCompare(b.type);
      if (groupBy === "status" && a.status !== b.status) return a.status.localeCompare(b.status);

      switch (sortBy) {
        case "plate":
          return a.licensePlate.localeCompare(b.licensePlate);
        case "model":
          return a.model.localeCompare(b.model);
        case "odometer":
          return b.odometer - a.odometer;
        default:
          return b.id - a.id;
      }
    });
  }, [groupBy, search, sortBy, statusFilter, vehicles]);

  // Calculate maintenance costs per vehicle
  const maintenanceCostMap = useMemo(() => {
    const costMap = new Map<number, number>();
    seedServiceLogs.forEach((log) => {
      costMap.set(log.vehicleId, (costMap.get(log.vehicleId) || 0) + log.cost);
    });
    return costMap;
  }, []);

  const saveVehicle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.model || !form.licensePlate || !form.maxPayloadTon || !form.initialOdometer) return;

    const maxPayloadTon = Number(form.maxPayloadTon);
    const initialOdometer = Number(form.initialOdometer);
    if (Number.isNaN(maxPayloadTon) || Number.isNaN(initialOdometer)) return;

    if (editingVehicleId) {
      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === editingVehicleId
            ? {
                ...vehicle,
                model: form.model,
                licensePlate: form.licensePlate,
                maxCapacity: maxPayloadTon * 1000,
                odometer: initialOdometer,
                type: form.type as Vehicle["type"],
              }
            : vehicle,
        ),
      );
    } else {
      const next: Vehicle = {
        id: Date.now(),
        model: form.model,
        licensePlate: form.licensePlate,
        maxCapacity: maxPayloadTon * 1000,
        odometer: initialOdometer,
        acquisitionCost: 70000,
        status: "Available",
        region: "North",
        type: form.type as Vehicle["type"],
      };

      setVehicles((prev) => [next, ...prev]);
    }

    setForm(initialForm);
    setEditingVehicleId(null);
    setShowNewVehicleForm(false);
  };

  const cancelNewVehicle = () => {
    setForm(initialForm);
    setEditingVehicleId(null);
    setShowNewVehicleForm(false);
  };

  const beginEditVehicle = (vehicle: Vehicle) => {
    setForm({
      licensePlate: vehicle.licensePlate,
      maxPayloadTon: String(Math.round(vehicle.maxCapacity / 1000)),
      initialOdometer: String(vehicle.odometer),
      type: vehicle.type,
      model: vehicle.model,
    });
    setEditingVehicleId(vehicle.id);
    setShowNewVehicleForm(true);
    setOpenMenuVehicleId(null);
  };

  const removeVehicle = (vehicleId: number) => {
    setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== vehicleId));
  };

  const confirmDeleteVehicle = async () => {
    if (!vehiclePendingDelete) return;
    setIsDeleteLoading(true);
    await Promise.resolve(removeVehicle(vehiclePendingDelete.id));
    setVehiclePendingDelete(null);
    setIsDeleteLoading(false);
  };

  const activeVehicleTrips = useMemo(() => {
    if (!activeVehicle) return [];
    return seedTrips.filter((trip) => trip.vehicleId === activeVehicle.id);
  }, [activeVehicle]);

  const activeVehicleService = useMemo(() => {
    if (!activeVehicle) return [];
    return seedServiceLogs.filter((log) => log.vehicleId === activeVehicle.id);
  }, [activeVehicle]);

  const iconClass = "h-4 w-4";

  return (
    <section className="space-y-3">
      <div className="wire-titlebar rounded-md border border-slate-700 px-3 py-2">
        <h1 className="wire-page-title">Vehicle Registry (Asset Management)</h1>
      </div>

      <div className={`grid gap-3 ${showNewVehicleForm ? "xl:grid-cols-[310px_1fr]" : "grid-cols-1"}`}>
        {showNewVehicleForm && (
          <form onSubmit={saveVehicle} className="wire-window h-fit p-3">
            <p className="mb-3 text-sm font-semibold text-slate-100">
              {editingVehicleId ? "Edit Vehicle" : "New Vehicle Registration"}
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <label className="block">
                <span className="mb-1 block">License Plate:</span>
                <input
                  value={form.licensePlate}
                  onChange={(event) => setForm((prev) => ({ ...prev, licensePlate: event.target.value }))}
                  className="wire-input w-full"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block">Max Payload:</span>
                <input
                  value={form.maxPayloadTon}
                  onChange={(event) => setForm((prev) => ({ ...prev, maxPayloadTon: event.target.value }))}
                  className="wire-input w-full"
                  placeholder="e.g. 5"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block">Initial Odometer:</span>
                <input
                  value={form.initialOdometer}
                  onChange={(event) => setForm((prev) => ({ ...prev, initialOdometer: event.target.value }))}
                  className="wire-input w-full"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block">Type:</span>
                <select
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                  className="wire-select w-full"
                >
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Trailer">Trailer</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block">Model:</span>
                <input
                  value={form.model}
                  onChange={(event) => setForm((prev) => ({ ...prev, model: event.target.value }))}
                  className="wire-input w-full"
                  required
                />
              </label>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button className="wire-button">{editingVehicleId ? "Update" : "Save"}</button>
              <button type="button" onClick={cancelNewVehicle} className="wire-button-alt">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="wire-window overflow-hidden min-h-[460px]">
          <div className="wire-toolbar">
            <input
              className="wire-input min-w-[220px]"
              placeholder="Search bar ....."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select value={groupBy} onChange={(event) => setGroupBy(event.target.value as typeof groupBy)} className="wire-select">
              <option value="none">Group by</option>
              <option value="type">Type</option>
              <option value="status">Status</option>
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="wire-select">
              <option value="All">Filter</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="wire-select">
              <option value="latest">Sort by...</option>
              <option value="plate">Plate</option>
              <option value="model">Model</option>
              <option value="odometer">Odometer</option>
            </select>
            <button onClick={() => setShowNewVehicleForm(true)} className="wire-button ml-auto" type="button">
              + New Vehicle
            </button>
          </div>

          <div className="overflow-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-900/80 text-pink-300">
                <tr>
                  <th className="border-b border-slate-700 px-2 py-2">NO</th>
                  <th className="border-b border-slate-700 px-2 py-2">Plate</th>
                  <th className="border-b border-slate-700 px-2 py-2">Model</th>
                  <th className="border-b border-slate-700 px-2 py-2">Type</th>
                  <th className="border-b border-slate-700 px-2 py-2">Capacity</th>
                  <th className="border-b border-slate-700 px-2 py-2">Odometer</th>
                  <th className="border-b border-slate-700 px-2 py-2">Status</th>
                  <th className="border-b border-slate-700 px-2 py-2">Performance</th>
                  <th className="border-b border-slate-700 px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-slate-400">
                      No vehicles found.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row, index) => (
                    <tr
                      key={row.id}
                      className="wire-table-row-hover border-t border-slate-700 text-slate-100 cursor-pointer"
                      onClick={() => setActiveVehicle(row)}
                    >
                      <td className="px-2 py-2">{index + 1}</td>
                      <td className="px-2 py-2">{row.licensePlate}</td>
                      <td className="px-2 py-2">{row.model}</td>
                      <td className="px-2 py-2">{row.type}</td>
                      <td className="px-2 py-2">{Math.round(row.maxCapacity / 1000)} ton</td>
                      <td className="px-2 py-2">{row.odometer}</td>
                      <td className="px-2 py-2">
                        <StatusBadge
                          status={
                            row.status === "Available"
                              ? "available"
                              : row.status === "On Trip"
                                ? "on-trip"
                                : row.status === "In Shop"
                                  ? "in-shop"
                                  : "retired"
                          }
                        />
                      </td>
                      <td className="px-2 py-2">
                        <VehiclePerformanceBadge
                          performance={calculateVehiclePerformance(row, seedTrips, maintenanceCostMap)}
                          variant="compact"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <div className="relative flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                          <IconActionButton
                            label="Edit Vehicle"
                            onClick={() => beginEditVehicle(row)}
                            icon={
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass}>
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                              </svg>
                            }
                          />
                          <IconActionButton
                            label="Delete Vehicle"
                            tone="danger"
                            onClick={() => {
                              setVehiclePendingDelete(row);
                              setOpenMenuVehicleId(null);
                            }}
                            icon={
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass}>
                                <path d="M3 6h18" />
                                <path d="M8 6V4h8v2" />
                                <path d="M19 6l-1 14H6L5 6" />
                              </svg>
                            }
                          />
                          <IconActionButton
                            label="More Actions"
                            onClick={() => setOpenMenuVehicleId((prev) => (prev === row.id ? null : row.id))}
                            icon={
                              <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
                                <circle cx="5" cy="12" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="19" cy="12" r="2" />
                              </svg>
                            }
                          />

                          {openMenuVehicleId === row.id && (
                            <div className="animate-fadeIn absolute right-0 top-9 z-10 w-40 rounded-md border border-slate-700 bg-slate-900/95 p-1 text-xs shadow-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  beginEditVehicle(row);
                                  setOpenMenuVehicleId(null);
                                }}
                                className="w-full rounded px-2 py-1.5 text-left text-slate-200 transition-colors hover:bg-slate-800"
                              >
                                Edit vehicle
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setVehiclePendingDelete(row);
                                  setOpenMenuVehicleId(null);
                                }}
                                className="w-full rounded px-2 py-1.5 text-left text-red-300 transition-colors hover:bg-slate-800"
                              >
                                Delete vehicle
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={Boolean(vehiclePendingDelete)}
        title="Delete Vehicle"
        message={`Are you sure you want to delete ${vehiclePendingDelete?.licensePlate ?? "this vehicle"}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleteLoading}
        onConfirm={confirmDeleteVehicle}
        onCancel={() => setVehiclePendingDelete(null)}
      />

      <DetailDrawer
        isOpen={Boolean(activeVehicle)}
        onClose={() => setActiveVehicle(null)}
        title={activeVehicle ? `${activeVehicle.model} (${activeVehicle.licensePlate})` : "Vehicle Details"}
        subtitle="Vehicle Registry Detail"
      >
        {activeVehicle && (
          <>
            <DrawerSummary
              items={[
                { label: "Plate", value: activeVehicle.licensePlate },
                { label: "Type", value: activeVehicle.type },
                { label: "Region", value: activeVehicle.region },
                { label: "Status", value: activeVehicle.status },
              ]}
            />

            <DrawerMetrics
              items={[
                { label: "Capacity", value: `${Math.round(activeVehicle.maxCapacity / 1000)} ton` },
                { label: "Odometer", value: `${activeVehicle.odometer.toLocaleString()} km` },
                { label: "Trips", value: String(activeVehicleTrips.length) },
                { label: "Service Events", value: String(activeVehicleService.length), tone: activeVehicleService.some((item) => !item.completed) ? "warning" : "good" },
              ]}
            />

            <DrawerHistory
              title="Historical Data"
              rows={
                activeVehicleTrips.length
                  ? activeVehicleTrips.slice(0, 5).map((trip) => `Trip #${trip.id} • ${trip.status} • ${trip.origin ?? "Unknown"} → ${trip.destination ?? "Unknown"}`)
                  : ["No trip history available"]
              }
            />

            <DrawerTimeline
              items={activeVehicleService.length
                ? activeVehicleService.map((log) => ({
                    date: log.date,
                    label: log.serviceType,
                    status: log.completed ? "Completed" : "Pending",
                  }))
                : [
                    {
                      date: "Current",
                      label: "No recent maintenance events",
                      status: activeVehicle.status,
                    },
                  ]}
            />
          </>
        )}
      </DetailDrawer>
    </section>
  );
}
