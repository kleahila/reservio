# Orest Paja

## Week 8 Tasks

- [ ] Fix Week 7 diagram issues on branch feature/week7-presentations, commit with message: fix: correct week7 diagrams
- [ ] Contribute ERD entities to the shared ERD led by Klea: Tenant (id, name, subdomain, plan, active, createdAt), User (id, tenantId, fullName, email, passwordHash, role, createdAt), Reservation (id, tenantId, userId, roomId, checkIn, checkOut, status, createdAt)
- [ ] Create state diagram for US-05 — Make a Reservation: states Idle → RoomSelected → DatesChosen → Validating → Confirmed / Unavailable → Error
- [ ] Create state diagram for US-06 — Reserve a Parking Spot: states Browsing → SpotSelected → Locked (5 min) → Confirmed / LockExpired → Error
- [ ] Create state diagram for US-07 — Order In-App Services: states Browsing → ItemAdded → CartReview → OrderPlaced → BilledToRoom / Error
- [ ] Create state diagram for US-08 — Early Check-In Notification: states Waiting → RoomCleaned (WebSocket event) → NotificationReceived → Dismissed
- [ ] Export all diagrams as PNG to docs/diagrams/week8/
- [ ] Commit on branch feature/week8-presentations: feat: add ERD entities tenant, user, reservation / feat: add state diagrams US-05 to US-08

## Work Summary

_Fill in after completing your tasks._
