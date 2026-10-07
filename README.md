# EnergyTwin - Digital Twin Energy Monitoring Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey)](https://expressjs.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-ws-green)](https://github.com/websockets/ws)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015-emerald)](https://supabase.com)

> **"See your building. Understand your energy. Improve your efficiency."**

**EnergyTwin** is an enterprise-grade digital twin building energy management SaaS platform. It combines real-time IoT smart meter telemetry, interactive 3D spatial building models, AI anomaly detection, machine learning load forecasting, and automated demand response curtailment with strict role-based access control and tenant isolation.

---

## 🌟 Key Architecture & Features

### 1. Dedicated Role-Based Panels (Strict RBAC)
Each operational role has its own dedicated, purpose-built dashboard interface and strictly scoped permission access:
* **👑 Super Admin Panel (`/admin-panel`)**:
  - Global cross-tenant management & tenant boundary isolation.
  - Multi-tenant organizations overview.
  - Enterprise user provisioning with 4-tier RBAC assignment.
  - IoT connectivity diagnostic center (Modbus TCP, BACnet/IP, WebSocket, and Supabase PostgREST cloud).
  - Immutable security audit trail with IP address logging.
* **🏢 Facility Operations Panel (`/facility-panel`)**:
  - Real-time equipment fleet monitoring (120+ HVAC units, chillers, elevators, pumps).
  - Runtime hours tracking and health status (Online, Warning, Critical, Maintenance).
  - Urgent alarm triage desk with 1-click resolution.
  - Preventive Maintenance (PM) dispatch ticketing for field technicians.
* **⚡ Energy Intelligence Panel (`/energy-panel`)**:
  - Continuous substation electrical load curve (kW) across all 24 IoT sub-meters.
  - Real-time power balance & Sankey energy flow diagram (Grid + Solar PV $\to$ Switchboard $\to$ Chillers, IT Data Center, Lighting, EV Chargers).
  - AI Anomaly Dossiers with measured vs. expected curves and confidence scoring.
  - Automated Demand Response & Peak Shaving simulator (setpoint offset slider, load shed kW, financial yield).
* **👤 Private Tenant Suite Portal (`/tenant-panel`)**:
  - Strictly isolated space telemetry (restricted to tenant's assigned suites).
  - Micro-zone indoor environmental metrics (Temperature, Humidity, $\text{CO}_2$ ppm, Occupancy headcount).
  - Sub-meter consumption (kWh) & allocated billing statements ($0.16/kWh).
  - In-suite thermostat adjustment request dispatched to facility management.

---

### 2. Interactive 3D Spatial Digital Twin
* **Exploded Floor Stack Toggle**: View all 6 floors stacked or explode layers with vertical offsets.
* **Multi-Mode 3D Rendering**:
  - *System Mesh*: Mechanical & electrical conduits.
  - *Thermal 3D*: Live temperature gradient heatmap across all building floors.
  - *Power Density*: Highlighting zones consuming above baseline limits.
* **Rooftop Solar PV Canopy**: Live generation telemetry (64.2 kW).
* **Hover HUD & Zone Telemetry Drawer**: Live kW, temperature, occupancy, equipment health, and alarm feed.

---

### 3. Real-Time IoT WebSocket Engine
* Streams synchronous 2-second telemetry ticks (`telemetry.tick`).
* Dispatches instantaneous threshold alarms (`alert.created`).
* Live connection indicator (**● Live**) with auto-reconnect fallback.

---

### 4. Supabase Cloud Integration
* Pre-configured connection to Supabase project (`qwvajvktwxvbzsheikxj.supabase.co`).
* SQL migration script in `supabase/schema.sql` for instant PostgreSQL cloud instantiation.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** >= 18.x
* **npm** >= 9.x

### 1. Clone the Repository
```bash
git clone https://github.com/Muhammadislam776/energymonitoring.git
cd energymonitoring
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds EnergyTwin Tower (6 floors, 48 rooms, 120 equipment, 24 meters, 30 days telemetry)
npm run dev      # Starts API & WebSocket server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
```

---

## 🔐 Credentials for Immediate Evaluation

| Role | Email | Password | Dedicated Route | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@energytwin.com` | `admin123` | `/admin-panel` | Global Root Authority |
| **Facility Manager** | `facility@energytwin.com` | `facility123` | `/facility-panel` | Assets & Floor Alarms |
| **Energy Manager** | `energy@energytwin.com` | `energy123` | `/energy-panel` | Analytics & Peak Shaving |
| **Tenant** | `tenant@apextech.com` | `tenant123` | `/tenant-panel` | Private Suite Isolation |

*(Alternatively, users can click **"Sign Up"** to register a new account with their preferred operational role!)*

---

## 🗄️ Database Schema & Supabase Setup

The platform uses SQLite for local fast testing and includes a full PostgreSQL schema migration for Supabase:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/qwvajvktwxvbzsheikxj).
2. Go to **SQL Editor**.
3. Run the SQL script from `supabase/schema.sql`.
4. All 16 tables (`organizations`, `tenants`, `users`, `buildings`, `floors`, `rooms`, `equipment`, `meters`, `energy_readings`, `anomalies`, `forecasts`, `recommendations`, `alerts`, `reports`, `audit_logs`, `system_settings`) will be created instantly.

---

## 📄 License
This project is licensed under the MIT License.
