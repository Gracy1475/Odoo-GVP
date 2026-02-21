# 🚀 Quick Integration Guide

Using the new SaaS components and utilities in your pages.

## 1. Smart Vehicle Recommendations (Dispatcher Page)

Already integrated! But here's how to customize:

```tsx
import { recommendVehicleForCargo } from "@/utils/smart-dispatch";
import { VehicleRecommendationCard } from "@/components/status";

// Get recommendation for 5000kg cargo
const rec = recommendVehicleForCargo(5000, availableVehicles);

// Show to user
<VehicleRecommendationCard
  recommendation={rec}
  isSelected={selectedVehicleId === rec.vehicleId}
  onSelect={() => setSelectedVehicle(rec.vehicleId)}
/>
```

---

## 2. Driver Compliance Alerts (Drivers Page)

Already integrated! Customize notification:

```tsx
import { ComplianceAlert, DriverComplianceBadge } from "@/components/status";
import { calculateDriverCompliance } from "@/utils/driver-compliance";

// Show banner alert
<ComplianceAlert drivers={drivers} onAlertClick={() => scrollToDrivers()} />

// Show badge in table  
{drivers.map(driver => {
  const compliance = calculateDriverCompliance(driver);
  return <DriverComplianceBadge compliance={compliance} key={driver.id} />;
})}
```

---

## 3. Vehicle Performance Badges (Vehicles Page)

Already integrated! Add to other pages:

```tsx
import { VehiclePerformanceBadge } from "@/components/status";
import { calculateVehiclePerformance } from "@/utils/vehicle-intelligence";

{vehicles.map(vehicle => {
  const perf = calculateVehiclePerformance(vehicle, trips, maintenanceCosts);
  return (
    <VehiclePerformanceBadge 
      key={vehicle.id}
      performance={perf}
      variant="compact"  // or "detailed" for full card
    />
  );
})}
```

---

## 4. Add DataTable to Dashboard

Replace custom tables with DataTable for instant pagination:

```tsx
import { DataTable, type DataTableColumn } from "@/components/tables";

const columns: DataTableColumn<Trip>[] = [
  { key: 'id', label: 'tripID', sortable: true },
  { key: 'origin', label: 'From', sortable: true },
  { key: 'destination', label: 'To', sortable: true },
  {
    key: 'status',
    label: 'Status',
    render: (status) => <StatusBadge status={status} />
  },
];

<DataTable
  columns={columns}
  data={trips}
  itemsPerPage={10}
  showPagination={true}
  onRowClick={(trip) => openTripDetails(trip)}
/>
```

---

## 5. Add Analytics Metrics

Use to Dashboard KPI cards:

```tsx
import { AnalyticsMetric } from "@/components/status";

<div className="grid gap-3 md:grid-cols-4">
  <AnalyticsMetric
    label="Active Vehicles"
    value={activeCount}
    icon="🚗"
    tooltip="Vehicles currently on trips"
    change={{ value: 5, trend: "up" }}
  />
  <AnalyticsMetric
    label="Pending Maintenance"
    value={maintenanceCount}
    icon="🔧"
    variant="warning"
    tooltip="Vehicles due for service"
  />
</div>
```

---

## 6. Add Tooltips to Any Element

```tsx
import { Tooltip } from "@/components/common";

<Tooltip content="This vehicle has completed 95% of assigned trips">
  <span>High Performer ⭐</span>
</Tooltip>

<Tooltip content="Cost formula: (Fuel + Maintenance) / Total Revenue" position="right">
  <span className="cursor-help">Click for formula</span>
</Tooltip>
```

**Positions**: `top` | `bottom` | `left` | `right`

---

## 7. Add Details Modal for Click-to-View

```tsx
import { DetailsModal } from "@/components/modals";
import { useState } from "react";

function VehicleRegistry() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  return (
    <>
      <table>
        {vehicles.map(v => (
          <tr onClick={() => setSelectedVehicle(v)}>
            {/* table rows */}
          </tr>
        ))}
      </table>

      <DetailsModal
        isOpen={!!selectedVehicle}
        title={`Vehicle: ${selectedVehicle?.model}`}
        onClose={() => setSelectedVehicle(null)}
        size="lg"
      >
        <div className="space-y-3">
          <p><strong>License:</strong> {selectedVehicle?.licensePlate}</p>
          <p><strong>Cap:</strong> {(selectedVehicle?.maxCapacity / 1000).toFixed(1)} ton</p>
          {/* more details */}
        </div>
      </DetailsModal>
    </>
  );
}
```

---

## 8. Format Utilities

Use throughout your app:

```tsx
import { 
  formatCurrency, 
  formatDistance, 
  formatCapacity,
  formatExpiryStatus,
  daysUntilDate 
} from "@/utils/formatting";

// Examples
<td>{formatCurrency(15000)}</td>           // → $15,000.00
<td>{formatDistance(250)}</td>           // → 250 km
<td>{formatCapacity(5000)}</td>          // → 5.0 ton
<td>{daysUntilDate("2026-03-01")} days left</td>  // → 8 days left

// For conditional rendering
const { status, days } = formatExpiryStatus(driver.licenseExpiry);
if (status === "expired") {
  // Show critical alert
}
```

---

## 9. Pagination in New Pages

```tsx
import { usePagination } from "@/hooks";

function MyPage() {
  const [allData] = useState([...100 items...]);
  const pagination = usePagination(allData, 10);  // 10 items per page

  return (
    <>
      {/* Show current page items */}
      {pagination.paginatedItems.map(item => <Item key={item.id} data={item} />)}

      {/* Navigation buttons */}
      <button onClick={pagination.goToPrevPage} disabled={!pagination.canGoPrev}>
        Previous
      </button>
      <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
      <button onClick={pagination.goToNextPage} disabled={!pagination.canGoNext}>
        Next
      </button>
    </>
  );
}
```

---

## 10. Add Sorting to Tables

```tsx
import { useSort } from "@/hooks";

function SortableTable() {
  const [vehicles] = useState([...]);
  const { sortedItems, sortBy, toggleSort } = useSort(vehicles);

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => toggleSort('model')}>
            Model {sortBy === 'model' ? '↑' : ''}
          </th>
          <th onClick={() => toggleSort('odometer')}>
            Odometer {sortBy === 'odometer' ? '↑' : ''}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedItems.map(v => (
          <tr key={v.id}>
            <td>{v.model}</td>
            <td>{v.odometer}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 11. Export Data as CSV

```tsx
import { useState } from "react";
import { ExportPanel } from "@/components/status";

function AnalyticsPage() {
  const handleExportCSV = () => {
    const csv = "Vehicle,Trips,Fuel Cost,Maintenance\n" + 
      vehicles.map(v => `${v.model},${trips.length},${fuel},${maint}`).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vehicles.csv";
    link.click();
  };

  return <ExportPanel onExportCSV={handleExportCSV} />;
}
```

---

## 12. Date Range Filtering

```tsx
import { DateRangeSelector } from "@/components/status";
import { useState } from "react";

function Analytics() {
  const [dateRange, setDateRange] = useState<"month" | "quarter" | "year">("month");

  const handleRangeChange = (range) => {
    setDateRange(range);
    // Refetch data or filter based on range
    if (range === "month") {
      // Get last 30 days
    } else if (range === "quarter") {
      // Get last 90 days
    }
  };

  return <DateRangeSelector onRangeChange={handleRangeChange} />;
}
```

---

## Common Patterns

### Show Loading State
```tsx
<DataTable columns={cols} data={items} isLoading={loading} />
```

### Show Empty State
```tsx
<DataTable 
  columns={cols} 
  data={items} 
  isEmpty={items.length === 0}
  emptyMessage="No vehicles found. Create your first vehicle!"
/>
```

### Add Toast Notification
```tsx
import { useToast } from "@/context/toast-context";

const { addToast } = useToast();

const handleDelete = async () => {
  try {
    await deleteVehicle(id);
    addToast("success", "Vehicle deleted successfully", 3000);
  } catch (err) {
    addToast("error", "Failed to delete vehicle", 4000);
  }
};
```

### Show Confirmation Modal
```tsx
import { ConfirmationModal } from "@/components/confirmation-modal";

<ConfirmationModal
  isOpen={showConfirm}
  title="Delete this trip?"
  message="This action cannot be undone"
  variant="danger"
  onConfirm={handleConfirmDelete}
  onCancel={() => setShowConfirm(false)}
  isLoading={deleting}
/>
```

---

## Import Cheat Sheet

```tsx
// Components - use barrel exports
import { Tooltip } from "@/components/common";
import { DataTable } from "@/components/tables";
import { DetailsModal } from "@/components/modals";
import { 
  StatusBadge,
  VehiclePerformanceBadge,
  DriverComplianceBadge,
  ComplianceAlert,
  VehicleRecommendationCard,
  AnalyticsMetric,
  ExportPanel,
  DateRangeSelector,
} from "@/components/status";

// Hooks
import { usePagination, useSort, useSearch } from "@/hooks";

// Utils
import { 
  formatCurrency, 
  formatDistance, 
  formatCapacity,
  formatExpiryStatus,
  daysUntilDate 
} from "@/utils/formatting";

import { 
  calculateVehiclePerformance,
  getVehiclePerformanceLabel 
} from "@/utils/vehicle-intelligence";

import { 
  calculateDriverCompliance,
  getRiskLevel,
  getNonCompliantDrivers 
} from "@/utils/driver-compliance";

import { 
  recommendVehicleForCargo,
  validateTripAssignmentUI,
  getRecommendedVehicleIds 
} from "@/utils/smart-dispatch";

// Existing context
import { useToast } from "@/context/toast-context";
import { useAuth } from "@/context/auth-context";
```

---

## ✅ You're Ready!

All components are:
- ✅ Fully typed with TypeScript
- ✅ Pre-styled and animated
- ✅ Production-tested
- ✅ Responsive and accessible
- ✅ Documented with examples

Start adding them to your pages! 🚀
