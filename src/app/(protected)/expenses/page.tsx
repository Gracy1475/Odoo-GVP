"use client";

import { FormEvent, useMemo, useState } from "react";
import { seedDrivers, seedExpenseLogs, seedTrips, seedVehicles } from "@/lib/fleet-data";
import { ExpenseLog } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";

interface ExpenseFormState {
  tripId: number;
  driverId: number;
  distance: number;
  fuelCost: number;
  miscExpense: number;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseLog[]>(seedExpenseLogs);
  const [showNewExpenseForm, setShowNewExpenseForm] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [form, setForm] = useState<ExpenseFormState>({
    tripId: seedTrips[0]?.id || 0,
    driverId: seedDrivers[0]?.id || 0,
    distance: 0,
    fuelCost: 0,
    miscExpense: 0,
  });

  // Search, filter, sort, group state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [groupBy, setGroupBy] = useState<"None" | "Driver" | "Status">("None");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Done">("All");
  const [sortBy, setSortBy] = useState<"Latest" | "Trip" | "Driver" | "Distance">("Latest");

  // Memoized visible rows with search, filter, sort, group
  const visibleRows = useMemo(() => {
    let filtered = expenses.filter((expense) => {
      // Search
      const trip = seedTrips.find((t) => t.id === expense.tripId);
      const driver = seedDrivers.find((d) => d.id === expense.driverId);
      const matchesSearch =
        !searchTerm ||
        expense.tripId.toString().includes(searchTerm.toLowerCase()) ||
        driver?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.distance.toString().includes(searchTerm.toLowerCase());

      // Filter by status
      const matchesFilter = filterStatus === "All" || expense.status === filterStatus;

      return matchesSearch && matchesFilter;
    });

    // Sort
    if (sortBy === "Latest") {
      filtered.sort((a, b) => b.id - a.id);
    } else if (sortBy === "Trip") {
      filtered.sort((a, b) => b.tripId - a.tripId);
    } else if (sortBy === "Driver") {
      filtered.sort((a, b) => {
        const dA = seedDrivers.find((d) => d.id === a.driverId)?.name || "";
        const dB = seedDrivers.find((d) => d.id === b.driverId)?.name || "";
        return dA.localeCompare(dB);
      });
    } else if (sortBy === "Distance") {
      filtered.sort((a, b) => b.distance - a.distance);
    }

    // Group (return flat array but visually grouped)
    return filtered;
  }, [expenses, searchTerm, filterStatus, sortBy]);

  const handleFormChange = (field: keyof ExpenseFormState, value: unknown) => {
    if (field === "distance" || field === "fuelCost" || field === "miscExpense") {
      setForm((prev) => ({ ...prev, [field]: Number(value) }));
    } else if (field === "tripId" || field === "driverId") {
      setForm((prev) => ({ ...prev, [field]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [field]: String(value) }));
    }
  };

  const addExpense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.tripId || !form.driverId || form.distance === 0) {
      setMessage("Please fill all required fields.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const newExpense: ExpenseLog = {
      id: Date.now(),
      tripId: form.tripId,
      driverId: form.driverId,
      distance: form.distance,
      fuelCost: form.fuelCost,
      miscExpense: form.miscExpense,
      status: "Done",
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // Reset form and close
    setForm({
      tripId: seedTrips[0]?.id || 0,
      driverId: seedDrivers[0]?.id || 0,
      distance: 0,
      fuelCost: 0,
      miscExpense: 0,
    });
    setShowNewExpenseForm(false);
    setMessage("Expense logged successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const cancelNewExpense = () => {
    setForm({
      tripId: seedTrips[0]?.id || 0,
      driverId: seedDrivers[0]?.id || 0,
      distance: 0,
      fuelCost: 0,
      miscExpense: 0,
    });
    setShowNewExpenseForm(false);
    setMessage("");
  };

  return (
    <section className="space-y-3">
      <div className="wire-titlebar rounded-md border border-slate-700">
        <h1 className="wire-page-title">Expense & Fuel Logging</h1>
      </div>

      <div className={`grid gap-3 ${showNewExpenseForm ? "lg:grid-cols-[310px_1fr]" : ""}`}>
        {/* New Expense Form Panel - Conditionally Visible */}
        {showNewExpenseForm && (
          <div className="wire-window space-y-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-100">New Expense</p>
              <button
                onClick={cancelNewExpense}
                className="text-slate-400 hover:text-slate-200 transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={addExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Trip ID <span className="text-rose-400">*</span>
                </label>
                <select
                  value={form.tripId}
                  onChange={(e) => handleFormChange("tripId", e.target.value)}
                  className="wire-select w-full"
                  required
                >
                  <option value={0}>Select trip...</option>
                  {seedTrips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      Trip {trip.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Driver <span className="text-rose-400">*</span>
                </label>
                <select
                  value={form.driverId}
                  onChange={(e) => handleFormChange("driverId", e.target.value)}
                  className="wire-select w-full"
                  required
                >
                  <option value={0}>Select driver...</option>
                  {seedDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Distance (km) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.distance}
                  onChange={(e) => handleFormChange("distance", e.target.value)}
                  className="wire-input w-full"
                  placeholder="Enter distance in km"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fuel Cost ($)
                </label>
                <input
                  type="number"
                  value={form.fuelCost}
                  onChange={(e) => handleFormChange("fuelCost", e.target.value)}
                  className="wire-input w-full"
                  placeholder="Enter fuel cost"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Misc Expense ($)
                </label>
                <input
                  type="number"
                  value={form.miscExpense}
                  onChange={(e) => handleFormChange("miscExpense", e.target.value)}
                  className="wire-input w-full"
                  placeholder="Enter miscellaneous expense"
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
                <button type="button" onClick={cancelNewExpense} className="wire-button-alt flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Expenses Table Panel */}
        <div className="wire-window overflow-hidden">
          <div className="wire-toolbar">
            <input
              className="wire-input min-w-[220px]"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="wire-select w-32"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as "None" | "Driver" | "Status")}
            >
              <option value="None">Group: None</option>
              <option value="Driver">Group: Driver</option>
              <option value="Status">Group: Status</option>
            </select>
            <select
              className="wire-select w-32"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "All" | "Pending" | "Done")
              }
            >
              <option value="All">Filter: All</option>
              <option value="Pending">Filter: Pending</option>
              <option value="Done">Filter: Done</option>
            </select>
            <select
              className="wire-select w-32"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "Latest" | "Trip" | "Driver" | "Distance")
              }
            >
              <option value="Latest">Sort: Latest</option>
              <option value="Trip">Sort: Trip</option>
              <option value="Driver">Sort: Driver</option>
              <option value="Distance">Sort: Distance</option>
            </select>
            <button onClick={() => setShowNewExpenseForm(true)} className="wire-button">
              + Add an Expense
            </button>
          </div>

          {/* Expenses Table */}
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Trip ID</th>
                <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Driver</th>
                <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Distance</th>
                <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Fuel Expense</th>
                <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Misc Expens</th>
                <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length > 0 ? (
                visibleRows.map((expense) => {
                  const driver = seedDrivers.find((d) => d.id === expense.driverId);
                  return (
                    <tr
                      key={expense.id}
                      className="border-b border-slate-800 hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="px-3 py-2 text-slate-200 font-semibold">{expense.tripId}</td>
                      <td className="px-3 py-2 text-slate-300">{driver?.name || "Unknown"}</td>
                      <td className="px-3 py-2 text-slate-300">{expense.distance.toLocaleString()} km</td>
                      <td className="px-3 py-2 text-slate-300">
                        ${expense.fuelCost.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        ${expense.miscExpense.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={expense.status === "Done" ? "done" : "pending"} label={expense.status} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-slate-400">
                    No expenses found.
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
