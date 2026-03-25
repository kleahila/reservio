# Reservio

## Overview 🚀

Reservio is a cloud-based, multi-tenant SaaS hotel management platform built as a browser-first web application. It enables multiple hotels to operate on the same system while keeping tenant data isolated, supporting end-to-end hotel workflows for guests and staff.

Designed with a responsive, mobile-first interface, Reservio combines operational management with a self-service guest experience through real-time updates, RBAC, and stateless JWT authentication.

## Features ✨

- Multi-tenant architecture with tenant-based data isolation
- Role-Based Access Control (RBAC) for secure role separation
- Real-time operational updates using WebSockets
- Room browsing and availability checking
- Reservation and booking workflows
- Check-in and check-out management
- Room status and occupancy management
- Housekeeping task prioritization
- Admin dashboards and tenant (hotel) management

## User Roles 👥

1. **Guest**
   - Browse rooms, check availability, and create/manage reservations
2. **Receptionist / Staff**
   - Handle bookings, check-in/check-out, and front-desk operations
3. **Housekeeper**
   - Track room cleaning priorities and update housekeeping status
4. **Hotel Administrator**
   - Manage rooms, staff, dashboards, and hotel-level configuration
5. **Super Administrator**
   - Manage tenants (hotels), platform-level controls, and global oversight

## Tech Stack 🛠️

| Layer          | Technology       |
| -------------- | ---------------- |
| Frontend       | React, Vite      |
| Backend        | Node.js, Express |
| Database       | PostgreSQL       |
| ORM            | Prisma           |
| Realtime       | Socket.io        |
| Authentication | JWT              |
| Deployment     | Railway          |
| CI/CD          | GitHub Actions   |

## Team

- **Backend:** Orest Paja, Licern Beqiri, Jorida Vrusho
- **Frontend:** Eleana Zharkalli, Ina Ndoni
- **System Modeling & Diagrams:** Joni Begaj
- **CI/CD, Deployment, Testing, Documentation:** Klea Hila
