"use client";

import { FormEvent, useMemo, useState } from "react";
import { seedServiceLogs, seedVehicles } from "@/lib/fleet-data";
import { ServiceLog, Vehicle } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";

interface ServiceFormState {
  vehicleId: number;
  issueService: string;
  date: string;
  cost: number;
}

export default function MaintenancePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [logs, setLogs] = useState<ServiceLog[]>(seedServiceLogs);
  const [showNewServiceForm, setShowNewServiceForm] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [form, setForm] = useState<ServiceFormState>({
    vehicleId: seedVehicles[0]?.id || 0,
    issueService: "",
    date: new Date().toISOString().slice(0, 10),
    cost: 0,
  });

  // Search, filter, sort, group state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [groupBy, setGroupBy] = useState<"None" | "Vehicle" | "Status">("None");
  const [filterStatus, setFilterStatus] = useState<"All" | "New" | "In Progress" | "Completed">("All");
  const [sortBy, setSortBy] = useState<"Latest" | "Vehicle" | "Date" | "Cost">("Latest");

  // Memoized visible rows with search, filter, sort, group
  const visibleRows = useMemo(() => {
    let filtered = logs.filter((log) => {
      // Search
      const vehicle = vehicles.find((v) => v.id === log.vehicleId);
      const matchesSearch =
        !searchTerm ||
        log.id.toString().includes(searchTerm.toLowerCase()) ||
        vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.date.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by status
      const logStatus = log.completed ? "Completed" : "New";
      const matchesFilter = filterStatus === "All" || logStatus === filterStatus;

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
    } else if (sortBy === "Date") {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === "Cost") {
      filtered.sort((a, b) => b.cost - a.cost);
    }

    // Group (return flat array but logically grouped)
    return filtered;
  }, [logs, searchTerm, filterStatus, sortBy, vehicles]);

  const handleFormChange = (field: keyof ServiceFormState, value: unknown) => {
    if (field === "cost") {
      setForm((prev) => ({ ...prev, [field]: Number(value) }));
    } else if (field === "vehicleId") {
      setForm((prev) => ({ ...prev, [field]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [field]: String(value) }));
    }
  };

  const addLog = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.vehicleId || !form.issueService || !form.date) {
      setMessage("Please fill all required fields.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const newLog: ServiceLog = {
      id: Date.now(),
      vehicleId: form.vehicleId,
      serviceType: form.issueService,
      cost: form.cost,
      date: form.date,
      completed: false,
    };

    setLogs((prev) => [newLog, ...prev]);
    setVehicles((prev) =>
      prev.map((vehicle) => (vehicle.id === form.vehicleId ? { ...vehicle, status: "In Shop" } : vehicle)),
    );

    // Reset form and close
    setForm({
      vehicleId: seedVehicles[0]?.id || 0,
      issueService: "",
      date: new Date().toISOString().slice(0, 10),
      cost: 0,
    });
    setShowNewServiceForm(false);
    setMessage("Service log created successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const cancelNewService = () => {
    setForm({
      vehicleId: seedVehicles[0]?.id || 0,
      issueService: "",
      date: new Date().toISOString().slice(0, 10),
      cost: 0,
    });
    setShowNewServiceForm(false);
    setMessage("");
  };

  const markComplete = (logId: number, vehicleId: number) => {
    setLogs((prev) => prev.map((log) => (log.id === logId ? { ...log, completed: true } : log)));
    setVehicles((prev) =>
      prev.map((vehicle) => (vehicle.id === vehicleId ? { ...vehicle, status: "Available" } : vehicle)),
    );
    setMessage("Service marked as completed!");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <section className="space-y-3">
      <div className="wire-titlebar rounded-md border border-slate-700">
        <h1 className="wire-page-title">Maintenance & Service Logs</h1>
      </div>

      <div className={`grid gap-3 ${showNewServiceForm ? "lg:grid-cols-[310px_1fr]" : ""}`}>
        {/* New Service Form Panel - Conditionally Visible */}
        {showNewServiceForm && (
          <div className="wire-window space-y-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-100">New Service</p>
              <button
                onClick={cancelNewService}
                className="text-slate-400 hover:text-slate-200 transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={addLog} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Vehicle Name <span className="text-rose-400">*</span>
                </label>
                <select
                  value={form.vehicleId}
                  onChange={(e) => handleFormChange("vehicleId", e.target.value)}
                  className="wire-select w-full"
                  required
                >
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} ({vehicle.licensePlate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Issue/Service <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.issueService}
                  onChange={(e) => handleFormChange("issueService", e.target.value)}
                  className="wire-input w-full"
                  placeholder="Enter issue or service type"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  className="wire-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cost ($)</label>
                <input
                  type="number"
                  value={form.cost}
                  onChange={(e) => handleFormChange("cost", e.target.value)}
                  className="wire-input w-full"
                  placeholder="Enter service cost"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Message */}
              {message && (
                <div className="text-xs text-cyan-300 bg-cyan-950/30 border border-cyan-800 rounded px-2 py-1">
                  {message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="wire-button flex-1">
                  Create
                </button>
                <button type="button" onClick={cancelNewService} className="wire-button-alt flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Service Logs Table Panel */}
        <div className="wire-window overflow-hidden">
          <div className="wire-toolbar">
            <input
              className="wire-input min-w-[220px]"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="wire-select w-32"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as "None" | "Vehicle" | "Status")}
            >
              <option value="None">Group: None</option>
              <option value="Vehicle">Group: Vehicle</option>
              <option value="Status">Group: Status</option>
            </select>
            <select
              className="wire-select w-32"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "All" | "New" | "In Progress" | "Completed")
              }
            >
              <option value="All">Filter: All</option>
              <option value="New">Filter: New</option>
              <option value="In Progress">Filter: In Progress</option>
              <option value="Completed">Filter: Completed</option>
            </select>
            <select
              className="wire-select w-32"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "Latest" | "Vehicle" | "Date" | "Cost")
              }
            >
              <option value="Latest">Sort: Latest</option>
              <option value="Vehicle">Sort: Vehicle</option>
              <option value="Date">Sort: Date</option>
              <option value="Cost">Sort: Cost</option>
            </select>
            <button onClick={() => setShowNewServiceForm(true)} className="wire-button">
              + Create New Service
            </button>
          </div>

          {/* Service Logs Table */}
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Log ID</th>
                <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Vehicle</th>
                <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Issue/Service</th>
                <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Date</th>
                <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Cost</th>
                <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length > 0 ? (
                visibleRows.map((log) => {
                  const vehicle = vehicles.find((v) => v.id === log.vehicleId);
                  const status = log.completed ? "Completed" : "New";
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-slate-800 hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="px-3 py-2 text-slate-200 font-semibold">{log.id}</td>
                      <td className="px-3 py-2 text-slate-300">{vehicle?.model || "Unknown"}</td>
                      <td className="px-3 py-2 text-slate-300">{log.serviceType}</td>
                      <td className="px-3 py-2 text-slate-300">
                        {new Date(log.date).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        ${log.cost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2">
                        {status === "Completed" ? (
                          <StatusBadge status="completed" />
                        ) : (
                          <button
                            onClick={() => markComplete(log.id, log.vehicleId)}
                            className="wire-button-alt px-2 py-1 text-[11px] hover:bg-slate-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-slate-400">
                    No service logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
