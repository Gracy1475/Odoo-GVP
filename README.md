<div align="center">

<br/>

# 🚛 FleetFlow
### Modular Fleet & Logistics Management System

**A production-grade, Firebase-powered fleet operations platform built for hackathons and real-world deployment.**

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite)](https://vite.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore+Auth-ff6f00?style=flat-square&logo=firebase)](https://firebase.google.com)
[![Recharts](https://img.shields.io/badge/Recharts-Charts-8884d8?style=flat-square)](https://recharts.org)

<br/>

![FleetFlow Dashboard Preview](./public/vite.svg)

</div>

---

## 📌 Overview

**FleetFlow** is a comprehensive fleet and logistics management system designed to replace inefficient manual logbooks with a centralized, rule-based digital hub. It optimizes the full lifecycle of a delivery fleet — from vehicle intake and driver compliance to trip dispatching, maintenance tracking, and financial analytics.

**Built for:** Fleet Managers · Dispatchers · Safety Officers · Financial Analysts

---

## 🤖 AI Used — Google Gemini (Antigravity)

This application was fully designed, architected, and code-generated using **Google Gemini via the Antigravity AI coding assistant** — an advanced agentic coding system developed by the **Google DeepMind** team.

### What the AI Did

| Capability | Details |
|---|---|
| **Full Architecture Design** | Designed the 8-page SPA structure, Firestore schema, React context model, and routing strategy |
| **Code Generation** | Generated ~3,500 lines of production-ready React, JavaScript, and CSS from a single natural-language specification |
| **Business Logic Implementation** | Implemented cargo weight validation, license expiry compliance, maintenance-to-status auto-linking, and trip lifecycle management |
| **Firebase Integration** | Architected and wrote the full Firestore CRUD layer, real-time `onSnapshot` listeners, auto-seeding logic, and Firebase Auth migration |
| **UI/UX Design** | Created the complete design system — dark theme, CSS custom properties, glassmorphism cards, status pills, micro-animations, and responsive layout |
| **Bug Detection & Fixing** | Identified and fixed a CSS-variable-in-JSX syntax error during the build phase automatically |
| **Verification** | Autonomously ran a browser test session validating all 8 pages, all business rules, and all navigation flows |

> **Model:** Google Gemini 2.5 Pro · **Interface:** Antigravity Agentic IDE (VS Code Extension) · **Mode:** Multi-step autonomous execution

---

## ✨ Features

### 🔐 Page 1 — Login & Authentication (Firebase Auth)
- Real Firebase Email/Password authentication
- **Role-Based Access Control** — Manager or Dispatcher
- Auto-register new users on first login (no manual sign-up needed)
- "Forgot Password" sends a real Firebase password reset email
- Persistent session across browser refreshes via `onAuthStateChanged`

### 📊 Page 2 — Command Center (Main Dashboard)
- **4 Live KPI Cards:** Active Fleet count, Maintenance Alerts, Utilization Rate (%), Pending Cargo
- **Fleet Status Bar Chart** — real-time distribution of Available / On Trip / In Shop / Retired vehicles
- **Compliance Warnings Panel** — drivers whose license expires within 30 days are surfaced immediately
- **Recent Trips Feed** — last 5 trips with status pills

### 🚗 Page 3 — Vehicle Registry (Asset Management)
- Full **CRUD** — Add, Edit, Delete vehicles with validation
- Fields: Name, Model, License Plate (unique), Type (Truck/Van/Bike), Max Load Capacity (kg), Odometer, Region, Acquisition Cost
- **Retire Toggle** — one-click Out of Service flag (cannot retire vehicles on active trips)
- Color-coded **Status Pills**: Available (green), On Trip (blue), In Shop (amber), Retired (red)
- Search by name or plate + filter by type and status

### 🗺️ Page 4 — Trip Dispatcher & Management
- **Trip Creation Form:** Select only Available vehicles + eligible drivers
- **🔴 Hard Validation Rule:** If `CargoWeight > MaxCapacity` → red warning banner appears, submit button is disabled
- **Driver Eligibility Check:** Expired license drivers are excluded from selection pool
- **Trip Lifecycle:** `Draft → Dispatched → Completed / Cancelled`
  - Dispatching → Vehicle + Driver set to **On Trip / On Duty**
  - Completing → Vehicle + Driver return to **Available / Off Duty** + odometer updated
- Full lifecycle status action buttons per row

### 🔧 Page 5 — Maintenance & Service Logs
- Log service entries: Service Type, Cost, Date, Notes
- **⚡ Auto-Logic:** Adding a maintenance log instantly sets the vehicle status to `In Shop` in Firestore → vehicle disappears from Dispatcher dropdown
- **Complete Maintenance** action → vehicle returns to `Available` (only when no other active logs exist for that vehicle)
- KPI summary: Total Logs, In Progress, Completed, Total Cost

### ⛽ Page 6 — Expense & Fuel Logging
- Log fuel fills: Vehicle, Liters, Cost per Liter, Date, Odometer, KM driven
- **Auto-calculated Total Cost** (Liters × Cost/L) shown live during form fill
- **Fuel efficiency** (km/L) shown per log entry
- **Total Operational Cost per Vehicle** = Fuel Costs + Maintenance Costs
- Visual cost breakdown with proportional progress bars

### 👤 Page 7 — Driver Performance & Safety Profiles
- Full driver CRUD with Safety Score slider (0–100)
- **License Expiry Compliance:**
  - 🔴 `Expired` badge — driver blocked from all trip assignments
  - 🟡 `Soon` badge — expiring within 30 days (warning)
  - ✅ Green shield — fully compliant
- **Safety Score** with color-coded progress bar (green ≥ 80, amber ≥ 60, red < 60)
- **Trip Completion Rate** bar per driver
- Status cycle toggle: `On Duty → Off Duty → Suspended` (locked while on an active trip)

### 📈 Page 8 — Operational Analytics & Financial Reports
- **Fuel Efficiency Chart** (km/L per vehicle) — Recharts bar chart
- **Monthly Fuel Spend Trend** — line chart  
- **Vehicle ROI Table:**  
  `ROI = (Revenue − (Fuel + Maintenance)) / Acquisition Cost × 100`
- Net Profit per vehicle (green if positive, red if negative)
- **One-click CSV Export** (PapaParse) — downloads full ROI report
- **One-click PDF Export** (jsPDF) — formatted report with all vehicle financials

---

## 🗄️ Firebase Architecture

### Firestore Collections

```
/vehicles/{id}
  name, model, plate, type, capacity, odometer,
  status, region, acquiCost, createdAt

/drivers/{id}
  name, license, licenseClass, expiry, status,
  safetyScore, tripsCompleted, tripsCancelled,
  assignedVehicle, createdAt

/trips/{id}
  vehicleId, driverId, origin, destination,
  cargoWeight, cargoDesc, status, revenue, distance,
  createdAt, dispatchedAt, completedAt, odometerEnd

/maintenanceLogs/{id}
  vehicleId, type, cost, date, notes,
  status (In Progress / Completed), createdAt

/fuelLogs/{id}
  vehicleId, liters, costPerLiter, totalCost,
  date, odometer, kmDriven, createdAt
```

### Key Firebase Features Used
- **Firestore** — NoSQL document database with real-time `onSnapshot` listeners
- **Firebase Auth** — Email/Password authentication with auto-registration
- **WriteBatch** — atomic multi-document writes for status transitions
- **Auto-seeding** — first-run detection seeds demo data to all collections

### Automatic Status Synchronization
All cross-collection status updates are performed atomically:

| Action | Vehicle | Driver |
|---|---|---|
| Create Trip (with driver) | `Available → On Trip` | `Off Duty → On Duty` |
| Complete Trip | `On Trip → Available` + odometer update | `On Duty → Off Duty`, trip count++ |
| Cancel Trip | `On Trip → Available` | `On Duty → Off Duty`, cancelled count++ |
| Add Maintenance Log | `Any → In Shop` | — |
| Complete Maintenance | `In Shop → Available` | — |

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18 | UI framework |
| **Vite** | 7 | Build tool & dev server |
| **react-router-dom** | v6 | Client-side routing + protected routes |
| **Firebase** | 11 | Firestore DB + Firebase Auth |
| **Recharts** | Latest | Analytics charts (bar, line) |
| **lucide-react** | Latest | Icon set |
| **react-hot-toast** | Latest | Toast notifications |
| **jsPDF** | Latest | PDF report export |
| **PapaParse** | Latest | CSV export |
| **Vanilla CSS** | — | Custom design system, no CSS framework |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Google Firebase project with Firestore and Authentication enabled

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd "ODOO X GVP"
npm install
```

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use an existing one)
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Enable **Firestore Database** → Start in **test mode** (or apply the security rules below)
5. Go to **Project Settings** → **Your apps** → **Web app** → Copy config

### 3. Configure Firebase

Open `src/firebase.js` and replace the placeholder config:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 4. Firestore Security Rules (Recommended)

Paste into Firebase Console → Firestore → Rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

> **First login:** Enter any email + password (≥ 6 chars). The account is auto-created in Firebase Auth and demo data is auto-seeded to Firestore.

---

## 📁 Project Structure

```
src/
├── context/
│   ├── AppContext.jsx     # Firestore state — real-time listeners, CRUD actions, auto-seed
│   └── AuthContext.jsx    # Firebase Auth — login, logout, onAuthStateChanged, password reset
├── pages/
│   ├── Login.jsx          # Firebase Auth login + role selector
│   ├── Dashboard.jsx      # Command Center — KPIs, charts, compliance feed
│   ├── Vehicles.jsx       # Asset Registry CRUD
│   ├── Trips.jsx          # Trip lifecycle management + cargo validation
│   ├── Maintenance.jsx    # Service logs + auto In Shop status
│   ├── Expenses.jsx       # Fuel logging + operational cost totals
│   ├── Drivers.jsx        # Driver profiles, compliance, safety scores
│   └── Analytics.jsx      # ROI charts + PDF/CSV export
├── components/
│   ├── Sidebar.jsx        # Navigation sidebar with active route
│   ├── Modal.jsx          # Reusable overlay modal
│   └── StatusPill.jsx     # Color-coded status badge
├── firebase.js            # Firebase app initialization
├── App.jsx                # Router + protected routes + loading screen
└── index.css              # Complete design system (CSS custom properties)
```

---

## 🎨 Design System

- **Theme:** Premium dark mode — deep navy (` #0a0e1a`) with electric blue (` #3b82f6`) and emerald green (` #10b981`) accents
- **Typography:** Inter (Google Fonts)
- **Components:** Glass-morphism cards, animated status pills with pulsing indicators, gradient KPI cards with accent top borders
- **Animations:** `fadeInUp` page transitions, `slideUp` modals, status `pulse`, skeleton loading
- **Responsive:** Sidebar fixed at 240px, content fluid; collapses gracefully on mobile

---

## 📋 Business Rules Summary

| Rule | Implementation |
|---|---|
| **Cargo validation** | `cargoWeight > vehicle.capacity` → red warning, submit disabled |
| **License expiry** | Expired drivers excluded from trip assignment dropdown |
| **Maintenance auto-status** | Log entry → vehicle `In Shop` (Firestore writeBatch) |
| **Trip completion** | Vehicle + Driver reverted to Available (atomic write) |
| **Retire lock** | Cannot retire a vehicle `On Trip` or `In Shop` |
| **Delete lock** | Cannot delete drivers on active trips |
| **ROI formula** | `(Revenue − Fuel − Maintenance) / AcquisitionCost × 100` |

---

## 📄 License

MIT — Built at a hackathon with ❤️ and Google Gemini AI.
