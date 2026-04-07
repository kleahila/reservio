# Reservio

> Multi-tenant SaaS hotel management platform — React + Vite + Tailwind CSS

---

## What is Reservio?

Reservio is a cloud-based hotel management platform that lets multiple hotels (tenants) run on the same system with isolated data. It covers the full hotel workflow — from guest room browsing to super admin tenant oversight.

---

## Getting It Running (5 steps)

### Prerequisites

Make sure you have these installed before the presentation:

- **Node.js** v18 or higher — check with `node -v`
- **npm** — comes with Node, check with `npm -v`

If Node isn't installed: download it from [nodejs.org](https://nodejs.org) (choose the LTS version).

---

### Step 1 — Clone or open the project

If you're on the presentation machine, copy the `reservio/` folder to the Desktop and open a terminal there:

```bash
cd ~/Desktop/reservio
```

### Step 2 — Go into the client folder

```bash
cd client
```

### Step 3 — Install dependencies

```bash
npm install
```

This takes about 30–60 seconds the first time. You only need to do it once.

### Step 4 — Start the development server

```bash
npm run dev
```

You'll see output like:

```
  VITE v5.4.x  ready in 200ms

  ➜  Local:   http://localhost:5173/
```

### Step 5 — Open the browser

Go to **http://localhost:5173**

The app opens on the Guest room browsing screen by default.

---

## Navigating the Demo

Since there's no login flow connected yet, navigate directly to each role's screens via the URL bar.

### Super Admin Screens

| Screen | URL |
|---|---|
| Tenant Management | http://localhost:5173/superadmin/tenants |
| Platform Analytics | http://localhost:5173/superadmin/analytics |
| Onboard New Hotel | http://localhost:5173/superadmin/onboard |
| Subscription Plans | http://localhost:5173/superadmin/plans |

### Hotel Admin Screens

| Screen | URL |
|---|---|
| Room Management | http://localhost:5173/admin/rooms |
| Staff Management | http://localhost:5173/admin/staff |
| Dynamic Pricing | http://localhost:5173/admin/pricing |
| Analytics Dashboard | http://localhost:5173/admin/analytics |
| Parking Management | http://localhost:5173/admin/parking |

### Staff Screens

| Screen | URL |
|---|---|
| Reservation Dashboard | http://localhost:5173/staff/reservations |
| Room Status Grid | http://localhost:5173/staff/rooms |
| Housekeeping Override | http://localhost:5173/staff/housekeeping |

### Housekeeper Screens

| Screen | URL |
|---|---|
| Task Board | http://localhost:5173/housekeeper/tasks |

### Guest Screens

| Screen | URL |
|---|---|
| Room Browsing | http://localhost:5173/guest/rooms |
| Parking Map | http://localhost:5173/guest/parking |
| Sunbed Map | http://localhost:5173/guest/sunbeds |
| Marketplace | http://localhost:5173/guest/marketplace |

---

## Things to Demo

### Tenant Management (`/superadmin/tenants`)
- Search tenants by name or subdomain
- Filter by plan (Basic / Premium / Custom) or status
- **Approve** a Pending tenant → status turns Active (green)
- **Suspend** an Active tenant → confirmation modal → turns orange
- **Change Plan** dropdown appears on row hover → confirmation modal
- **Delete** a tenant with confirmation

### Onboard New Hotel (`/superadmin/onboard`)
- Type a hotel name → subdomain auto-generates
- Select a plan by clicking the plan cards
- Submit → success toast appears + entry logged below the form
- Try submitting an already-taken subdomain (e.g. `grandhotel`) → shows error

### Dynamic Pricing (`/admin/pricing`)
- Toggle the rule ON/OFF — the ring changes color
- Set threshold to **33%** (current mock occupancy) → the green banner activates
- Live price table on the right shows adjusted prices in real-time

### Parking Management (`/admin/parking`)
- **Grid view** — click any spot card to cycle its status (Available → Occupied → Maintenance → Reserved)
- Each status has its own color — green, blue, orange, purple
- Switch to **Table view** for detailed info and locked-until timestamps
- Add a new spot, edit price, or remove a spot

### Analytics Dashboard (`/admin/analytics`)
- Set a date range to filter reservations — all KPIs recalculate live
- Click the **Occupancy** card → navigates to Dynamic Pricing
- Right panel shows status breakdown with mini progress bars

---

## Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.

---

## Troubleshooting

**Port already in use?**
Vite automatically picks the next free port (5174, 5175, etc.). Check the terminal for the actual URL.

**`npm install` fails?**
Make sure you're inside the `client/` folder, not the root `reservio/` folder.

**Page shows blank or crashes?**
Hard refresh with `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6 |
| Build tool | Vite |
| Styling | Tailwind CSS |
| State | React useState (mock data, no backend needed) |
| Backend (planned) | Node.js, Express, PostgreSQL, Prisma |
| Auth (planned) | JWT |
| Realtime (planned) | Socket.io |

---

## Team

| Role | Members |
|---|---|
| Backend | Orest Paja, Licern Beqiri, Jorida Vrusho |
| Frontend | Eleana Zharkalli, Ina Ndoni |
| System Modeling & Diagrams | Joni Begaj |
| CI/CD, Deployment, Testing, Docs | Klea Hila |
