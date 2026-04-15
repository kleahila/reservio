# Requirements Engineering – US-05, US-06, US-07, US-08
### Hotel Management System

---

## 1. User Scenarios List

| Nr    | Name                            | Description                                                                                   |
|-------|---------------------------------|-----------------------------------------------------------------------------------------------|
| US_05 | Make a Reservation              | Guest: The guest books a room by selecting dates and confirming the reservation.              |
| US_06 | Reserve a Parking Spot          | Guest: The guest selects an available parking spot from a visual lot map and locks it for 5 minutes to prevent double-booking. |
| US_07 | Order In-App Services           | Guest: The guest orders extra services (spa, room service, airport transfer) through the in-app marketplace; the cost is automatically billed to the room. |
| US_08 | Receive Early Check-In Notification | Guest: The guest receives a real-time notification when their room has been cleaned and is ready for early check-in. |

---

## 2. User Scenarios Extended

**US_05: Make a Reservation**
1. Guest logs into the system.
2. Guest navigates to the room browsing page.
3. Guest enters check-in and check-out dates.
4. System filters and displays only available rooms for the selected period.
5. Guest selects a room and reviews details (type, price, description).
6. Guest confirms the booking.
7. System validates room availability in real time.
8. System saves the reservation and generates a booking reference.
9. System displays a confirmation message to the guest.

**US_06: Reserve a Parking Spot**
1. Guest logs into the system.
2. Guest navigates to the parking reservation section.
3. System displays a visual map of the parking lot with available and occupied spots.
4. Guest selects an available spot on the map.
5. System locks the selected spot for 5 minutes.
6. No other guest can book the same spot during the lock period.
7. Guest confirms the reservation before the timer expires.
8. System saves the parking reservation and links it to the guest's booking.
9. If the guest does not confirm within 5 minutes, the spot is automatically released.

**US_07: Order In-App Services**
1. Guest logs into the system.
2. Guest navigates to the in-app marketplace.
3. System displays available services (spa, room service, airport transfer) with descriptions and pricing.
4. Guest selects one or more services.
5. Guest confirms the order.
6. System adds the total cost to the guest's room bill.
7. System sends a confirmation notification to the guest.
8. If a service is unavailable, the system notifies the guest before checkout.

**US_08: Receive Early Check-In Notification**
1. Housekeeper marks the guest's room as cleaned in the system.
2. System automatically detects the status change.
3. System generates a real-time notification containing the room number and cleaned status.
4. Notification is delivered to the guest's account immediately.
5. Guest receives and views the notification on their dashboard.
6. Guest is now informed they can proceed with early check-in.

---

## 3. Use Cases

---

### UC_05: Make a Reservation

| Field                          | Detail                                                                                                                                                                                                              |
|--------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **UC Name**                    | UC_05 – Make a Reservation                                                                                                                                                                                          |
| **Summary**                    | The guest selects a room and dates, and the system validates availability and saves the reservation.                                                                                                                 |
| **Dependency**                 | Includes “Validate Room Availability”. UC_01 (User Login) is a precondition.                                                                                                                                        |
| **Actors**                     | Primary: Guest                                                                                                                                                                                                      |
| **Preconditions**              | 1. Guest is logged in. 2. At least one room is available in the system.                                                                                                                                             |
| **Description of Main Sequence** | 1. Guest navigates to the room browsing page. 2. Guest enters check-in and check-out dates. 3. System displays available rooms for those dates. 4. Guest selects a room. 5. Guest confirms the reservation. 6. System validates availability. 7. System saves the reservation. 8. System displays a booking confirmation with a reference number. |
| **Description of Alternative Sequence** | 1. Room becomes unavailable: System notifies the guest and prompts them to select another room. 2. Guest cancels before confirming: No reservation is saved. |
| **Non-Functional Requirements** | The availability check must respond within 2 seconds. Reservation data must be persisted reliably with no data loss.                                                                                               |
| **Postconditions**             | 1. Reservation is saved and assigned a unique reference number. 2. Room is marked as reserved for the selected dates. 3. Guest can view the reservation on their dashboard.                                         |

---

### UC_06: Reserve a Parking Spot

| Field                          | Detail                                                                                                                                                                                                              |
|--------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **UC Name**                    | UC_06 – Reserve a Parking Spot                                                                                                                                                                                      |
| **Summary**                    | The guest selects a parking spot from a visual map; the system locks it for 5 minutes to prevent double-booking.                                                                                                    |
| **Dependency**                 | Includes “Lock Parking Spot”. UC_01 (User Login) and UC_05 (Make a Reservation) are preconditions.                                                                                                                  |
| **Actors**                     | Primary: Guest                                                                                                                                                                                                      |
| **Preconditions**              | 1. Guest is logged in. 2. Guest has an active or confirmed reservation. 3. At least one parking spot is available.                                                                                                  |
| **Description of Main Sequence** | 1. Guest navigates to the parking section. 2. System displays a visual parking lot map with available and occupied spots. 3. Guest selects an available spot. 4. System immediately locks the spot for 5 minutes. 5. Guest confirms the reservation within 5 minutes. 6. System saves the parking reservation and links it to the guest's booking. 7. System updates the map to show the spot as reserved. |
| **Description of Alternative Sequence** | 1. Guest does not confirm within 5 minutes: System releases the lock and makes the spot available again. 2. Spot is taken simultaneously by another session: System notifies the guest that the spot is no longer available and prompts reselection. |
| **Non-Functional Requirements** | The locking mechanism must be real-time and synchronised across all active sessions. Lock expiry must trigger automatically without manual intervention.                                                            |
| **Postconditions**             | 1. Parking spot is reserved and linked to the guest's booking. 2. Spot is marked as occupied on the visual map. 3. Guest receives confirmation of the parking reservation.                                          |

---

### UC_07: Order In-App Services

| Field                          | Detail                                                                                                                                                                                                              |
|--------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **UC Name**                    | UC_07 – Order In-App Services                                                                                                                                                                                       |
| **Summary**                    | The guest browses and orders services from the in-app marketplace; costs are automatically billed to their room.                                                                                                    |
| **Dependency**                 | UC_01 (User Login) and UC_05 (Make a Reservation) are preconditions.                                                                                                                                                |
| **Actors**                     | Primary: Guest                                                                                                                                                                                                      |
| **Preconditions**              | 1. Guest is logged in. 2. Guest has an active reservation. 3. At least one service is available in the marketplace.                                                                                                 |
| **Description of Main Sequence** | 1. Guest navigates to the in-app marketplace. 2. System displays available services with descriptions and pricing. 3. Guest selects one or more services. 4. Guest confirms the order. 5. System validates the order. 6. System adds the cost to the guest's room bill. 7. System sends a confirmation notification to the guest. |
| **Description of Alternative Sequence** | 1. A selected service is unavailable: System notifies the guest before they confirm. 2. Guest cancels the order before confirmation: No charge is applied. |
| **Non-Functional Requirements** | Billing must be applied atomically – no partial charges. The marketplace must display accurate, up-to-date service availability and pricing.                                                                        |
| **Postconditions**             | 1. Order is saved and linked to the guest's room bill. 2. Guest receives a confirmation of the order. 3. Hotel staff are notified of the order as applicable.                                                       |

---

### UC_08: Receive Early Check-In Notification

| Field                          | Detail                                                                                                                                                                                                              |
|--------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **UC Name**                    | UC_08 – Receive Early Check-In Notification                                                                                                                                                                         |
| **Summary**                    | When a housekeeper marks a room as cleaned, the system sends a real-time notification to the guest informing them the room is ready.                                                                                |
| **Dependency**                 | Triggered by housekeeping use case (US‑21: Mark Room As Cleaned). UC_05 (Make a Reservation) is a precondition.                                                                                                     |
| **Actors**                     | Primary: Guest. Secondary: Housekeeper (triggers the notification indirectly).                                                                                                                                      |
| **Preconditions**              | 1. Guest has a confirmed reservation with an early check-in request or pending arrival. 2. Housekeeper has access to the room management system.                                                                    |
| **Description of Main Sequence** | 1. Housekeeper marks the room as cleaned in the system. 2. System detects the status change. 3. System generates a notification with the room number and ready status. 4. Notification is delivered in real time to the guest's account. 5. Guest views the notification on their dashboard. |
| **Description of Alternative Sequence** | 1. Guest's account is not reachable (e.g., logged out): Notification is queued and displayed upon next login. 2. Room is marked clean but reservation is not yet active: Notification is held until the guest's check-in window begins. |
| **Non-Functional Requirements** | Notification must be delivered within 5 seconds of the room status change. The system must support real-time push delivery across devices.                                                                         |
| **Postconditions**             | 1. Guest has been notified of room readiness. 2. Notification is logged and visible on the guest dashboard. 3. Room status is updated system-wide.                                                                  |

---

## 4. Functional Requirements

| Req#  | Requirement                                                                                                  | Comments                                                              | Priority | Date       | Reviewed/Approved |
|-------|--------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|----------|------------|-------------------|
| FR_01 | The system shall allow a guest to select a room and enter check-in and check-out dates to initiate a booking. | Core step of the reservation flow.                                    | 1        |            |                   |
| FR_02 | The system shall validate room availability in real time based on the selected dates before confirming a reservation. | Prevents double-booking.                                              | 1        |            |                   |
| FR_03 | The system shall save a confirmed reservation and assign it a unique reference number.                        | Required for tracking and guest access.                               | 1        |            |                   |
| FR_04 | The system shall display a booking confirmation message to the guest upon successful reservation.              | Provides feedback to the user.                                        | 2        |            |                   |
| FR_05 | The system shall display a visual parking lot map showing available and occupied spots to the guest.           | Required for the parking selection feature.                           | 2        |            |                   |
| FR_06 | The system shall lock a selected parking spot for 5 minutes upon selection to prevent concurrent booking.     | Prevents double-booking of parking spots.                             | 1        |            |                   |
| FR_07 | The system shall automatically release a parking spot lock if the guest does not confirm within 5 minutes.   | Ensures spots are not held indefinitely.                              | 1        |            |                   |
| FR_08 | The system shall display the in-app marketplace listing all available services with their descriptions and prices. | Enables guests to browse and order services.                          | 2        |            |                   |
| FR_09 | The system shall add the cost of ordered services to the guest's room bill automatically upon order confirmation. | Eliminates manual billing steps.                                      | 1        |            |                   |
| FR_10 | The system shall send a confirmation notification to the guest after a service order is placed.               | Confirms the order was received.                                      | 2        |            |                   |
| FR_11 | The system shall generate and deliver a real-time notification to the guest when a housekeeper marks their room as cleaned. | Core mechanism for early check-in notification.                       | 1        |            |                   |
| FR_12 | The notification delivered to the guest shall include the room number and cleaned status.                     | Gives the guest all necessary information in one message.             | 2        |            |                   |
| FR_13 | The system shall display room-readiness notifications on the guest's dashboard.                               | Ensures guests can access the notification even after it is delivered. | 2        |            |                   |
| FR_14 | The system shall prevent any other guest from booking a parking spot that is currently locked by another session. | Enforces the 5-minute exclusive lock.                                 | 1        |            |                   |
| FR_15 | The system shall link a parking reservation to the guest's active room booking.                               | Ensures parking and room reservations are associated.                 | 2        |            |                   |

---

## 5. Non-Functional Requirements

### i) Product Requirements

**User Interface Requirements**
The reservation, parking, marketplace, and notification interfaces shall be responsive and accessible on both desktop and mobile devices. All interactive elements (room cards, parking map, service listings) shall follow a consistent visual design with clear status indicators.

**Learnability**
A new guest shall be able to complete a room reservation or service order without prior training, relying solely on the interface layout and labels.

**Accessibility**
The system shall meet WCAG 2.1 AA accessibility standards, including sufficient colour contrast, keyboard navigation support, and screen reader compatibility.

**Efficiency**
The parking lot map shall render and reflect real-time spot availability within 2 seconds of page load.

**Dependability / Memorability**
A returning guest shall be able to resume an interrupted reservation or service order from their dashboard without re-entering all details.

**Errors**
If a room becomes unavailable after a guest has selected it but before confirmation, the system shall display a clear error message and redirect the guest to reselect. Parking lock expiry shall be communicated with a countdown timer visible to the guest.

**Security**
All reservation and billing data shall be transmitted over HTTPS. Guest billing information shall not be exposed in client-side responses.

---

### ii) Organizational Requirements

**Availability**
The reservation and notification systems shall be available 99.9% of the time. Planned maintenance windows shall not occur during peak check-in/check-out hours (06:00–12:00).

**Latency**
Response time for critical operations (room booking, parking lock, payment processing, notification delivery) shall be under 2 seconds under normal load.

**Monitoring**
The system shall log all reservation events, service orders, parking locks, and notification deliveries for audit and support purposes.

**Maintenance**
Software updates shall be deployed without interrupting active guest sessions. The system shall support zero-downtime deployments.

**Standards Compliance**
The system shall follow RESTful API design standards for all backend services related to reservations, parking, and marketplace operations.

**Portability**
The web application shall function correctly on the latest versions of Chrome, Firefox, Safari, and Edge without browser-specific workarounds.

---

### iii) External Requirements

**Protection**
Guest personal data (name, email, payment details) shall be stored encrypted at rest and in transit in compliance with GDPR.

**Authorization and Authentication**
All features covered by US-05 to US-08 shall require an authenticated session. Role-based access control shall prevent staff from placing guest orders or modifying guest reservations without authorisation.

**Legislative Requirements**
The system shall comply with applicable data protection regulations (GDPR) regarding storage, access, and deletion of guest personal and payment data. Parking and room billing records shall be retained for the legally required period.