# Licern Beqiri

## Week 8 Tasks

- [ ] Fix Week 7 diagram issues on branch feature/week7-presentations, commit with message: fix: correct week7 diagrams
- [ ] Contribute ERD entities to the shared ERD led by Klea: Room (id, tenantId, type, description, pricePerNight, status, createdAt), ParkingSpot (id, tenantId, label, status, pricePerNight, lockedUntil), Sunbed (id, tenantId, label, zone, status, lockedUntil), HousekeepingTask (id, tenantId, roomId, priority, urgency, assignedTo, completedAt)
- [ ] Create state diagram for US-13 — Update Room Status: states Available → Occupied / Maintenance → Available (WebSocket broadcast on each transition)
- [ ] Create state diagram for US-14 — Override Housekeeping Priority: states Normal → MarkedUrgent → QueueReordered (WebSocket) → TaskCompleted → Normal
- [ ] Create state diagram for US-15 — Manage Hotel Rooms: states Idle → AddingRoom / EditingRoom / DeletingRoom → Saved → Error
- [ ] Create state diagram for US-16 — Manage Staff Accounts: states Idle → CreatingAccount / Editing / Deactivating → Saved → PermissionsApplied → Error
- [ ] Export all diagrams as PNG to docs/diagrams/week8/
- [ ] Commit on branch feature/week8-presentations: feat: add ERD entities room, parkingspot, sunbed, housekeepingtask / feat: add state diagrams US-13 to US-16

## Work Summary

_Fill in after completing your tasks._
