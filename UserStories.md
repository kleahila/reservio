Guest User Stories

US-01: Guest Account Registration
As a guest,
I want to register a personal account with full name, email, and password,
so that I can manage my hotel reservations and booking history.

Acceptance Criteria
• The user can access a registration page.
• The user must enter:
. Full Name
. Email
. Password
• Email must be unique in the system.
• If registration succeeds, the account is created and the user can log in.

US-02: Guest Login
As a guest,
I want to log in with email and password,
so that I can be redirected to a personalized guest dashboard showing upcoming stays.

Acceptance Criteria
• The login page accepts the email and password.
• The system validates credentials.
• If credentials are correct, the user is redirected to the guest dashboard.
• The dashboard displays upcoming stays.
• If credentials are incorrect, an error message is displayed.

US-03: Browse Available Rooms
As a guest,
I want to browse available rooms with photos, descriptions, room type, and price per night,
so that I can find a room matching my preferences.

Acceptance Criteria
• The system displays a list of rooms.
• Each room shows:
. Room type
. Price per night
. Description
. Photos
• Guests can scroll through all available rooms.

US-04: Check Room Availability
As a guest,
I want to enter check-in and check-out dates to filter rooms,
so that I can ensure the room is available during my stay.

Acceptance Criteria
• The user can enter:
. Check-in date
. Check-out date
• The system shows only rooms available during that period.
• Rooms already booked for those dates are not shown.

US-05: Make a Reservation
As a guest,
I want to book a selected room for chosen dates,
so that I can reserve accommodation for my trip.

Acceptance Criteria
• The user selects a room and dates.
• The system validates availability.
• The reservation is saved in the system.
• The user receives a confirmation message.

US-06: Reserve a Parking Spot
As a guest,
I want to reserve a parking spot by selecting from a visual lot map,
so that the system locks my selection for 5 minutes to prevent double-booking.

Acceptance Criteria
• The guest can access a visual parking lot map.
• The guest can select an available parking spot.
• The system locks the selection for 5 minutes.
• No other guest can book the same spot during the lock period.
• After 5 minutes, the spot is released if not confirmed.

US-07: Order In-App Services
As a guest,
I want to order services (spa, room service, airport transfer) through the in-app marketplace,
so that they are automatically billed to my room.

Acceptance Criteria
• The guest can access an in-app marketplace.
• The marketplace displays available services with pricing.
• The guest can place an order for one or more services.
• The cost is automatically added to the guest's room bill.
• The guest receives confirmation of their order.

US-08: Receive Early Check-In Notification
As a guest,
I want to receive a real-time notification when my room has been cleaned,
so that I can be ready for early check-in.

Acceptance Criteria
• The system sends a notification when housekeeping marks the room as cleaned.
• The notification is delivered in real-time to the guest's account.
• The notification includes the room number and status.
• The guest can see this information on their dashboard.

Staff & Housekeeping User Stories

US-09: View Reservation Dashboard
As hotel staff,
I want to view a reservation dashboard listing all bookings,
so that I can monitor guest bookings and room occupancy.

Acceptance Criteria
• Staff can access a reservation dashboard.
• The dashboard shows:
. Guest name
. Room number
. Check-in date
. Check-out date
. Current status
• Staff can see all bookings at a glance.

US-10: Confirm Pending Reservations
As hotel staff,
I want to confirm a pending reservation,
so that its status updates in the system and becomes visible to the guest.

Acceptance Criteria
• Staff can select a reservation.
• Staff can mark the reservation as confirmed.
• The reservation status updates in the system.
• The guest can see the updated status in their account.

US-11: Register Guest Check-In
As hotel staff,
I want to register a guest check-in by selecting the reservation,
so that I can mark the room as occupied in the system.

Acceptance Criteria
• Staff can access check-in functionality.
• Staff can select a reservation scheduled for the current date.
• Staff can mark the reservation as checked in.
• The system updates the room status to occupied.

US-12: Process Guest Check-Out
As hotel staff,
I want to process a guest check-out,
so that a housekeeping task is automatically triggered and the guest's digital access is cleared.

Acceptance Criteria
• Staff can select active reservations.
• Staff can mark the reservation as checked out.
• The system automatically triggers a housekeeping task.
• Guest digital access is revoked.
• The room status becomes available for future bookings.

US-13: Update Room Status
As hotel staff,
I want to update a room's status (Available, Occupied, Maintenance),
so that changes are instantly reflected across the system.

Acceptance Criteria
• Staff can select a room.
• Staff can update status to:
. Available
. Occupied
. Maintenance
• Changes are immediately visible in the reservation system.
• All staff see the updated status in real-time.

US-14: Override Housekeeping Priority
As hotel staff,
I want to override a room's housekeeping priority and flag it as urgent,
so that the Housekeeper's task list is re-sorted in real-time across devices.

Acceptance Criteria
• Staff can select a room with a housekeeping task.
• Staff can override its priority and mark it as urgent.
• The housekeeper's task list updates immediately.
• The change is synced across all devices in real-time.

US-20: Receive Auto-Prioritized Task List
As a housekeeper,
I want to receive an auto-prioritized task list sorted by check-out time and urgency,
so that rooms for on-site guests are moved to the top.

Acceptance Criteria
• The housekeeper receives a task list on their device.
• Tasks are automatically sorted by:
. Check-out time
. Urgency level
. On-site guest status
• Rooms with on-site guests appear at the top.
• The list updates when new check-outs occur or priority is overridden.

US-21: Mark Room As Cleaned
As a housekeeper,
I want to mark a room as cleaned,
so that its status is instantly updated at the front desk and the guest is notified if applicable.

Acceptance Criteria
• The housekeeper can access their assigned rooms.
• The housekeeper can mark a room as cleaned.
• The system instantly updates the room status at the front desk.
• If applicable, the guest receives a notification about the clean room.
• The room becomes available for the next guest.

Administrator & Analytics User Stories

US-15: Manage Hotel Rooms
As an administrator,
I want to add, edit, or remove rooms with details like type, description, price, and photos,
so that inventory is kept accurate.

Acceptance Criteria
• Admin can add new rooms with all relevant details.
• Admin can edit room details:
. Room type
. Description
. Price
. Photos
• Admin can delete rooms from the system.
• Changes are reflected immediately across the system.

US-16: Manage Staff Accounts
As an administrator,
I want to create, update, or deactivate staff accounts and assign role-based permissions,
so that staff has appropriate system access.

Acceptance Criteria
• Admin can create staff accounts.
• Admin can update staff information and roles.
• Admin can assign role-based permissions.
• Admin can deactivate or delete staff accounts.
• Permission changes take effect immediately.

US-17: Configure Dynamic Pricing Rules
As an administrator,
I want to configure dynamic pricing rules (e.g., +20% increase) triggered automatically when occupancy exceeds 80%,
so that pricing can be optimized based on demand.

Acceptance Criteria
• Admin can set dynamic pricing rules.
• Admin can define the occupancy threshold (e.g., 80%).
• Admin can set price adjustments (e.g., +20%).
• The system automatically applies the pricing rule when triggered.
• Admin can view the occupancy percentage in real-time.
• Pricing changes apply to future bookings.

US-18: View Analytics Dashboard
As an administrator,
I want to view a dashboard with total bookings, daily revenue, and occupancy percentage,
so that I can monitor hotel performance.

Acceptance Criteria
• Admin dashboard displays:
. Total bookings
. Daily revenue
. Occupancy percentage
• Metrics are filterable by date range.
• Dashboard updates in real-time.
• Admin can export reports if needed.

US-19: Manage Parking Lot
As an administrator,
I want to manage the parking lot by adding/removing spots, setting pricing per night, and viewing occupancy,
so that parking inventory is properly tracked.

Acceptance Criteria
• Admin can add new parking spots.
• Admin can remove parking spots.
• Admin can set pricing per night for each spot or category.
• Admin can view current occupancy and availability.
• Changes are reflected immediately across all systems.
