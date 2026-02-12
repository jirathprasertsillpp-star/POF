# POF PACIFIC — FACTORY OS

A premium, enterprise-grade factory operating system built with React, Vite, and Framer Motion.

## 🚀 Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

## 🏭 Core Features

### 1. Role-Based Access
- **Owner**: Executive overview, KPI monitoring (OEE, Output, Overrides), Override logs.
- **Manager**: Operational control, Urgent job management, Machine status detail.
- **Operator**: Simplified worklist (NOW/NEXT), Job execution (Start/Pause/Complete).

### 2. Premium UX/UI
- **Dark Navy Industrial Theme**: Designed for low-eye-strain control room environments.
- **Glassmorphism**: Modern transparent panels with blur effects.
- **Animations**:
    - "Flow River" background animation.
    - Pulsing "Urgent" cards.
    - Diagonal moving stripes for "Running" machine status.
    - Smooth drawer slides and stacking.

### 3. Finite Capacity Planning Simulation
- **Mock Database**: Realistic seed data with 20 Sales Orders (SOs) and 4 stations (S1-S4).
- **Execution Engine**: Simulates time flow, dependencies, and bottlenecks.
- **KPI Calculation**: Real-time OEE and utilization metrics.

### 4. OUTPUT LOG View (New Feature!)
- **Production Execution Logs**: Real-time tracking of all production events
- **Key Metrics Dashboard**: 
  - Total Events
  - Jobs Completed
  - Total Output (pieces)
  - Yield Rate
- **Detailed Event Tracking**: START, PAUSE, RESUME, COMPLETE, ERROR events
- **Comprehensive Information**: Timestamp, SO Number, Customer, Station, Machine, Output, Scrap, Operator
- **Premium UI**: Themed table with color-coded event badges and responsive design

### 5. Internationalization (i18n)
- One-click toggle between **English (EN)** and **Thai (TH)**.
- All technical terms and UI elements translate instantly.

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Drawer.jsx       # Stackable drawer system
│   ├── MachineStatusBar.jsx # Animated status bars
│   └── SOCard.jsx       # Flow River cards
├── data/
│   └── db.js            # Mock simulation engine & data
├── views/               # Page views
│   ├── RoleGate.jsx     # Entry screen
│   ├── Login.jsx        # Role-aware login
│   ├── Dashboard.jsx    # Main control tower
│   ├── OutputTable.jsx  # Production Output Log (with OUTPUT LOG view)
│   ├── SODetail.jsx     # Order details (Plan/Timeline)
│   ├── MachineDetail.jsx # Machine status & queue
│   └── Worklist.jsx     # Operator interface
├── i18n.js              # Translation dictionary
└── index.css            # Design tokens & global styles
```

## 🔐 Demo Credentials

Use these credentials for all roles (Owner, Manager, Operator):
- **Username**: `sa`
- **Password**: `sa`

## 🛠️ Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Framer Motion** - Animations
- **Lucide React** - Icon library

## 📊 Views Overview

1. **SO DATA** - Sales Order overview
2. **TIMECARD** - Resource allocation and timing
3. **PLAN MANAGER** - Production planning sequence
4. **PLAN OP** - Operator planning view
5. **OUTPUT LOG** - Production execution logs (NEW!)
6. **SUMMARY** - Performance metrics and insights

## 🎨 Design Philosophy

- **Cyber Industrial Theme** (Dark Mode): Monospace fonts, neon accents, technical aesthetics
- **Executive Paper Theme** (Light Mode): Clean, professional, business-focused
- Premium UX with smooth animations and responsive interactions
- Mobile-first responsive design

## 📝 License

Proprietary - POF PACIFIC Group

## 👥 Project Info

**Repository**: https://gitlab.com/pauljirath-group/pauljirath-project

For issues, questions, or contributions, please contact the project maintainers.
