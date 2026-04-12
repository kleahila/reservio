# Reservio

Multi-tenant SaaS hotel management platform — React 18 · Vite · Tailwind CSS

---

## Overview

Reservio lets multiple hotels run on a shared platform with isolated data. It covers the full hotel workflow across five user roles: guest, staff, housekeeper, hotel admin, and super admin.

The frontend is a pure React SPA with mock data — no backend required to run it.

---

## Running the Frontend

### Prerequisites

- Node.js v18+ — `node -v` to check
- npm — ships with Node

### Steps

```bash
# From the repo root
cd client
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Navigating the Portals

The fastest way to navigate between portals is the built-in role switcher:

**http://localhost:5173/dev/switcher**

Click any role to set your session and jump directly to that portal. No login credentials needed.

---

### URL Reference

#### Super Admin

| Screen             | URL                       |
| ------------------ | ------------------------- |
| Tenant Management  | /superadmin/tenants       |
| Platform Analytics | /superadmin/analytics     |
| Onboard New Hotel  | /superadmin/onboard       |
| Subscription Plans | /superadmin/subscriptions |

#### Hotel Admin

| Screen              | URL              |
| ------------------- | ---------------- |
| Room Management     | /admin/rooms     |
| Staff Management    | /admin/staff     |
| Dynamic Pricing     | /admin/pricing   |
| Analytics Dashboard | /admin/analytics |
| Parking Management  | /admin/parking   |

#### Staff

| Screen                | URL                 |
| --------------------- | ------------------- |
| Reservation Dashboard | /staff/dashboard    |
| Reservation List      | /staff/reservations |
| Room Status Grid      | /staff/rooms        |
| Housekeeping Override | /staff/housekeeping |

#### Housekeeper

| Screen     | URL                |
| ---------- | ------------------ |
| Task Board | /housekeeper/tasks |

#### Guest

| Screen             | URL                 |
| ------------------ | ------------------- |
| Landing            | /                   |
| Room Browsing      | /rooms              |
| Room Detail        | /rooms/:id          |
| Check Availability | /rooms/availability |
| Parking Map        | /parking            |
| Sunbed Map         | /sunbeds            |
| Marketplace        | /marketplace        |
| Guest Dashboard    | /guest/dashboard    |

---

## Demo Highlights

**Tenant Management** (`/superadmin/tenants`)

- Filter by plan and status, search by name or subdomain
- Approve pending tenants, suspend/reactivate, change plans, delete with confirmation

**Onboard Hotel** (`/superadmin/onboard`)

- Hotel name auto-generates the subdomain slug
- Duplicate subdomain validation

**Dynamic Pricing** (`/admin/pricing`)

- Toggle rules on/off — price table updates live
- Set occupancy threshold to 33% to trigger the active state

**Parking Management** (`/admin/parking`)

- Grid view: click any spot to cycle its status
- Table view: add, edit, remove spots

**Reservation Dashboard** (`/staff/dashboard`)

- Confirm pending → check in → check out workflow
- KPI cards update with every action

---

## Project Structure

```
reservio/
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/      # Shared UI (Sidebar, Modal, PageHeader, StatusBadge, …)
│   │   ├── context/         # ThemeContext (light/dark)
│   │   ├── data/            # Mock data (mockRooms, mockReservations, …)
│   │   ├── hooks/           # useAuth, useTenant
│   │   ├── layouts/         # GuestLayout, PortalLayout, per-role wrappers
│   │   └── pages/           # guest/ staff/ housekeeper/ admin/ superadmin/ dev/
│   ├── tailwind.config.js   # rv- design token definitions
│   └── index.html
├── docs/
│   ├── design/              # Figma screens
│   └── requirements/        # SRS and user stories (PDF)
└── README.md
```

---

## Tech Stack

| Layer              | Technology                                       |
| ------------------ | ------------------------------------------------ |
| Frontend           | React 18, React Router v6                        |
| Build              | Vite                                             |
| Styling            | Tailwind CSS with CSS variable theme tokens      |
| State              | React useState + Context (mock data, no backend) |
| Backend (planned)  | Node.js, Express, PostgreSQL, Prisma             |
| Auth (planned)     | JWT                                              |
| Realtime (planned) | Socket.io                                        |

---

## Team

Orest Paja, Licern Beqiri, Jorida Vrusho, Eleana Zharkalli, Ina Ndoni, Joni Begaj, Klea Hila
