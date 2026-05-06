# Reservio

Multi-tenant SaaS hotel management platform — React 18 · Vite · Tailwind CSS · Node.js · Express · PostgreSQL · Prisma

---

## Overview

Reservio lets multiple hotels run on a shared platform with isolated data. It covers the full hotel workflow across five user roles: **guest, staff, housekeeper, hotel admin, and super admin**.

The frontend is a React SPA connected to a real REST API backend with JWT authentication.

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | v18+ | `node -v` |
| npm | v9+ | `npm -v` |
| PostgreSQL | v14+ | `psql --version` |

---

## Quickstart

### 1 — Clone and install

```bash
git clone <repo-url>
cd reservio

# Install frontend deps
cd client && npm install && cd ..

# Install backend deps
cd server && npm install && cd ..
```

### 2 — Configure the backend

```bash
cd server
cp .env.example .env   # if .env doesn't exist yet
```

Edit `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/reservio"
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

### 3 — Set up the database

```bash
cd server
npx prisma migrate dev --name init   # creates tables
npm run seed                          # seeds demo data
```

### 4 — Configure the frontend

```bash
cd client
cp .env.example .env
```

`client/.env` should contain:

```env
VITE_API_URL=http://localhost:4000
```

### 5 — Start both servers

**Terminal 1 — Backend:**

```bash
cd server
npm run dev        # nodemon on port 4000
```

**Terminal 2 — Frontend:**

```bash
cd client
npm run dev        # Vite on port 5173
```

Open **http://localhost:5173**

---

## Authentication

All portals share a single login page at `/login`. The backend returns a JWT whose `role` field determines where you land:

| Role | Login redirect |
|---|---|
| `GUEST` | `/guest/dashboard` |
| `STAFF` | `/staff/reservations` |
| `HOUSEKEEPER` | `/housekeeper/tasks` |
| `HOTEL_ADMIN` | `/admin/rooms` |
| `SUPER_ADMIN` | `/superadmin/tenants` |

Demo credentials are created by the seed script (`npm run seed` in `/server`).

---

## URL Reference

### Guest Portal (requires `GUEST` JWT)

| Screen | URL |
|---|---|
| Landing | `/` |
| Room Browsing | `/rooms` |
| Room Detail | `/rooms/:id` |
| Check Availability | `/rooms/availability` |
| Reservation Flow | `/reservation/:roomId` |
| Parking Map | `/parking` |
| Sunbed Map | `/sunbeds` |
| Marketplace | `/marketplace` |
| Dashboard | `/guest/dashboard` |

### Staff Portal (requires `STAFF` JWT)

| Screen | URL |
|---|---|
| Reservation Dashboard | `/staff/dashboard` |
| Reservation List | `/staff/reservations` |
| Room Status Grid | `/staff/rooms` |
| Housekeeping Override | `/staff/housekeeping` |

### Housekeeper Portal (requires `HOUSEKEEPER` JWT)

| Screen | URL |
|---|---|
| Task Board | `/housekeeper/tasks` |

### Hotel Admin Portal (requires `HOTEL_ADMIN` JWT)

| Screen | URL |
|---|---|
| Room Management | `/admin/rooms` |
| Staff Management | `/admin/staff` |
| Dynamic Pricing | `/admin/pricing` |
| Analytics Dashboard | `/admin/analytics` |
| Parking Management | `/admin/parking` |

### Super Admin Portal (requires `SUPER_ADMIN` JWT)

| Screen | URL |
|---|---|
| Tenant Management | `/superadmin/tenants` |
| Platform Analytics | `/superadmin/analytics` |
| Onboard New Hotel | `/superadmin/onboard` |
| Subscription Plans | `/superadmin/subscriptions` |

---

## API

The backend runs at `http://localhost:4000`. Every request must include:

```
Content-Type: application/json
X-Tenant-Subdomain: grandtirana
Authorization: Bearer <jwt>   (all protected routes)
```

Key route groups: `/api/auth`, `/api/rooms`, `/api/reservations`, `/api/parking`, `/api/sunbeds`, `/api/services`, `/api/orders`, `/api/housekeeping`, `/api/staff`, `/api/pricing/rules`, `/api/analytics/summary`, `/api/superadmin`

---

## Project Structure

```
reservio/
├── client/                        # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/                   # API modules (client.js + one file per domain)
│   │   ├── components/            # Shared UI: Sidebar, Modal, ProtectedRoute, …
│   │   ├── context/               # AuthContext (JWT), ThemeContext
│   │   ├── data/                  # Legacy mock data (kept as fallback)
│   │   ├── hooks/                 # useAuth (re-exports AuthContext), useTenant
│   │   ├── layouts/               # GuestLayout, AdminLayout, …
│   │   └── pages/                 # guest/ staff/ housekeeper/ admin/ superadmin/
│   ├── .env.example
│   └── tailwind.config.js
├── server/                        # Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── routes/                # One file per domain, mirrors client/src/api/
│   │   ├── middleware/            # tenantResolver, auth
│   │   ├── services/              # Business logic
│   │   └── index.js               # Express entry point (port 4000)
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL schema
│   │   └── seed.js                # Demo data seed
│   └── .env.example
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6 |
| Build | Vite |
| Styling | Tailwind CSS with `rv-*` CSS variable design tokens |
| Auth | JWT (decoded client-side, no library) |
| Backend | Node.js, Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Realtime | Socket.io (server wired, client planned) |

---

## Team

Orest Paja · Licern Beqiri · Jorida Vrusho · Eleana Zharkalli · Ina Ndoni · Joni Begaj · Klea Hila
