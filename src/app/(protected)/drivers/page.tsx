"use client";

import { useMemo, useState } from "react";
import { seedDrivers, seedTrips, suspendExpiredDrivers } from "@/lib/fleet-data";
import { StatusBadge } from "@/components/status-badge";
import { ComplianceAlert, DriverComplianceBadge } from "@/components/status";
import { calculateDriverCompliance } from "@/utils/driver-compliance";
import { DetailDrawer, DrawerHistory, DrawerMetrics, DrawerSummary, DrawerTimeline } from "@/components/drawer";

interface DriverProfile {
  id: number;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  category: string;
  status: string;
  safetyScore: number;
  completionRate: number;
  complaints: number;
}

export default function DriversPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [groupBy, setGroupBy] = useState<"None" | "Status">("None");
  const [filterStatus, setFilterStatus] = useState<"All" | "On Duty" | "Off Duty" | "Suspended">("All");
  const [sortBy, setSortBy] = useState<"Latest" | "Name" | "Completion Rate" | "Safety Score">("Latest");
  const [activeDriver, setActiveDriver] = useState<DriverProfile | null>(null);

  const drivers = useMemo(() => suspendExpiredDrivers(seedDrivers), []);

  const driverProfiles: DriverProfile[] = useMemo(
    () =>
      drivers.map((driver) => {
        const driverTrips = seedTrips.filter((trip) => trip.driverId === driver.id);
        const completedTrips = driverTrips.filter((trip) => trip.status === "Completed").length;
        const completionRate = driverTrips.length ? (completedTrips / driverTrips.length) * 100 : 0;
        const complaints = Math.max(0, 100 - driver.safetyScore); // Simple calculation

        return {
          id: driver.id,
          name: driver.name,
          licenseNumber: `${driver.id}${driver.category}${100 + driver.id}`,
          licenseExpiry: driver.licenseExpiry,
          category: driver.category,
          status: driver.status,
          safetyScore: driver.safetyScore,
          completionRate,
          complaints: Math.round(complaints / 25), // Scale to 0-4 range
        };
      }),
    [drivers],
  );

  // Memoized visible rows with search, filter, sort, group
  const visibleRows = useMemo(() => {
    const filtered = driverProfiles.filter((profile) => {
      // Search
      const matchesSearch =
        !searchTerm ||
        profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.licenseExpiry.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by status
      const matchesFilter = filterStatus === "All" || profile.status === filterStatus;

      return matchesSearch && matchesFilter;
    });

    // Sort
    if (sortBy === "Latest") {
      filtered.sort((a, b) => b.id - a.id);
    } else if (sortBy === "Name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "Completion Rate") {
      filtered.sort((a, b) => b.completionRate - a.completionRate);
    } else if (sortBy === "Safety Score") {
      filtered.sort((a, b) => b.safetyScore - a.safetyScore);
    }

    // Group (return flat array but logically grouped)
    return filtered;
  }, [driverProfiles, searchTerm, filterStatus, sortBy]);

  // Format expiry date from YYYY-MM-DD to MM/DD format
  const formatExpiryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}`;
  };

  const activeDriverTrips = useMemo(() => {
    if (!activeDriver) return [];
    return seedTrips.filter((trip) => trip.driverId === activeDriver.id);
  }, [activeDriver]);

  return (
    <section className="space-y-3">
      <div className="wire-titlebar rounded-md border border-slate-700">
        <h1 className="wire-page-title">Driver Performance & Safety Profiles</h1>
      </div>

      {/* Compliance Alert */}
      <ComplianceAlert drivers={drivers} />

      {/* Drivers Table Panel */}
      <div className="wire-window overflow-hidden">
        <div className="wire-toolbar">
          <input
            className="wire-input min-w-[220px]"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="wire-select w-32"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as "None" | "Status")}
          >
            <option value="None">Group: None</option>
            <option value="Status">Group: Status</option>
          </select>
          <select
            className="wire-select w-40"
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "All" | "On Duty" | "Off Duty" | "Suspended")
            }
          >
            <option value="All">Filter: All</option>
            <option value="On Duty">Filter: On Duty</option>
            <option value="Off Duty">Filter: Off Duty</option>
            <option value="Suspended">Filter: Suspended</option>
          </select>
          <select
            className="wire-select w-40"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "Latest" | "Name" | "Completion Rate" | "Safety Score")
            }
          >
            <option value="Latest">Sort: Latest</option>
            <option value="Name">Sort: Name</option>
            <option value="Completion Rate">Sort: Completion Rate</option>
            <option value="Safety Score">Sort: Safety Score</option>
          </select>
        </div>

        {/* Driver Performance Table */}
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Name</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">License#</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Expiry</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Status</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Compliance</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Completion Rate</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Safety Score</th>
              <th className="border-b border-slate-700 px-3 py-2 text-cyan-300 font-semibold">Complaints</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length > 0 ? (
              visibleRows.map((profile) => {
                const statusMap: Record<string, "on-duty" | "off-duty" | "suspended"> = {
                  "On Duty": "on-duty",
                  "Off Duty": "off-duty",
                  "Suspended": "suspended",
                };
                const driverRecord = drivers.find((d) => d.id === profile.id);
                const compliance = driverRecord ? calculateDriverCompliance(driverRecord) : null;
                return (
                  <tr
                    key={profile.id}
                    className="wire-table-row-hover border-b border-slate-800 cursor-pointer"
                    onClick={() => setActiveDriver(profile)}
                  >
                    <td className="px-3 py-2 text-slate-200 font-semibold">{profile.name}</td>
                    <td className="px-3 py-2 text-slate-300">{profile.licenseNumber}</td>
                    <td className="px-3 py-2 text-slate-300">{formatExpiryDate(profile.licenseExpiry)}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={statusMap[profile.status] || "off-duty"} />
                    </td>
                    <td className="px-3 py-2">
                      {compliance && <DriverComplianceBadge compliance={compliance} />}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {profile.completionRate.toFixed(0)}%
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {profile.safetyScore}%
                    </td>
                    <td className="px-3 py-2 text-cyan-300 font-semibold">
                      {profile.complaints}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-slate-400">
                  No drivers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DetailDrawer
        isOpen={Boolean(activeDriver)}
        onClose={() => setActiveDriver(null)}
        title={activeDriver ? activeDriver.name : "Driver Details"}
        subtitle="Driver Profile Detail"
      >
        {activeDriver && (
          <>
            <DrawerSummary
              items={[
                { label: "Driver", value: activeDriver.name },
                { label: "License", value: activeDriver.licenseNumber },
                { label: "Category", value: activeDriver.category },
                { label: "Status", value: activeDriver.status },
              ]}
            />

            <DrawerMetrics
              items={[
                { label: "Safety Score", value: `${activeDriver.safetyScore}%`, tone: activeDriver.safetyScore >= 85 ? "good" : "warning" },
                { label: "Completion Rate", value: `${activeDriver.completionRate.toFixed(0)}%`, tone: activeDriver.completionRate >= 80 ? "good" : "warning" },
                { label: "Trips Assigned", value: String(activeDriverTrips.length) },
                { label: "Complaints", value: String(activeDriver.complaints), tone: activeDriver.complaints > 1 ? "danger" : "default" },
              ]}
            />

            <DrawerHistory
              title="Historical Data"
              rows={
                activeDriverTrips.length
                  ? activeDriverTrips.map((trip) => `Trip #${trip.id} • ${trip.status} • ${trip.origin ?? "Unknown"} → ${trip.destination ?? "Unknown"}`)
                  : ["No trip history available"]
              }
            />

            <DrawerTimeline
              items={[
                { date: "Last compliance scan", label: "License reviewed", status: `Expiry ${formatExpiryDate(activeDriver.licenseExpiry)}` },
                { date: "Operational", label: "Safety score update", status: `${activeDriver.safetyScore}%` },
                { date: "Current", label: "Current duty status", status: activeDriver.status },
              ]}
            />
          </>
        )}
      </DetailDrawer>
    </section>
  );
}
