Guest User Stories

US-01: Guest Account Registration
As a guest,
I want to create a personal account,
so that I can manage my hotel reservations and booking history.

Acceptance Criteria
•	The user can access a registration page.
•	The user must enter:
 .	Full Name
 .	Email
 .	Password
 .	Confirmed password
•	Email must be unique in the system.
•	If registration succeeds, the account is created and the user can log in.

US-02: Guest Login
As a guest,
I want to log into my account,
so that I can access my reservations and personal information.

Acceptance Criteria
•	The login page accepts the email and password.
•	The system validates credentials.
•	If credentials are correct, the user is redirected to the guest dashboard.
•	If credentials are incorrect, an error message is displayed.

US-03: Browse Available Rooms
As a guest,
I want to browse available rooms,
so that I can select a room that matches my preferences and budget.

Acceptance Criteria
•	The system displays a list of rooms.
•	Each room shows:
 .	Room type
 .	Price per night
 .	Description
 .	Photos
•	Guests can scroll through all available rooms.

US-04: Check Room Availability
As a guest,
I want to check room availability for specific dates,
so that I can ensure the room is available during my stay.

Acceptance Criteria
•	The user can enter:
 .	Check-in date
 .	Check-out date
•	The system shows only rooms available during that period.
•	Rooms already booked for those dates are not shown.

US-05: Make a Reservation
As a guest,
I want to book a room,
so that I can reserve accommodation for my trip.

Acceptance Criteria
•	The user selects a room.
•	The user selects check-in and check-out dates.
•	The system validates availability.
•	The reservation is saved in the system.
•	The user receives a confirmation message.

Hotel Staff User Stories

US-06: View Reservations
As hotel staff,
I want to view all current reservations,
so that I can monitor guest bookings and room occupancy.

Acceptance Criteria
•	Staff can access a reservation dashboard.
•	The dashboard shows:
 .	Guest name
 .	Room number
 .	Check-in date
 .	Check-out date
 .	Reservation status.

US-07: Confirm Reservations
As hotel staff,
I want to confirm guest reservations,
so that the booking becomes officially approved by the hotel.

Acceptance Criteria
•	Staff can select a reservation.
•	Staff can mark the reservation as confirmed.
•	The reservation status updates in the system.
•	The guest can see the updated status in their account.

US-08: Process Guest Check-In
As hotel staff,
I want to register guest check-ins,
so that room occupancy is properly tracked.

Acceptance Criteria
•	Staff can select a reservation scheduled for the current date.
•	Staff can mark the reservation as checked in.
•	The system updates the room status to occupied.

US-09: Process Guest Check-Out
As hotel staff,
I want to check out guests,
so that the room becomes available for future bookings.

Acceptance Criteria
•	Staff can select active reservations.
•	Staff can mark the reservation as checked out.
•	The system updates the room status to available.

US-10: Update Room Status
As hotel staff,
I want to update room status,
so that rooms can be marked as available, occupied, or under maintenance.

Acceptance Criteria
•	Staff can select a room.
•	Staff can update status to:
 .	Available
 .	Occupied
 .	Maintenance
•	Changes are immediately visible in the reservation system.

Administrator User Stories

US-11: Manage Hotel Rooms
As an administrator,
I want to add, edit, or remove hotel rooms,
so that the system reflects the correct hotel inventory.

Acceptance Criteria
•	Admin can add new rooms.
•	Admin can edit room details:
 .	Room type
 .	Description
 .	Price
•	Admin can delete rooms from the system.

US-12: Manage Staff Accounts
As an administrator,
I want to create and manage staff accounts,
so that staff members can access the system with proper permissions.

Acceptance Criteria
•	Admin can create staff accounts.
•	Admin can update staff information.
•	Admin can deactivate or remove staff accounts.

US-13: Configure Room Pricing
As an administrator,
I want to set and update room prices,
so that the hotel can manage its pricing strategy.

Acceptance Criteria
•	Admin can set a price per room type.
•	Admin can modify prices at any time.
•	Updated prices apply to future bookings.

US-14: Monitor Reservations
As an administrator,
I want to view all reservations in the system,
so that I can monitor hotel activity and bookings.

Acceptance Criteria
•	Admin dashboard displays all reservations.
•	Reservations can be filtered by:
 .	Date
 .	Status
 .	Guest
•	Admin can view reservation details.

US-15: View System Reports
As an administrator,
I want to view system statistics and reports,
so that I can analyze hotel performance.

Acceptance Criteria
•	Admin dashboard displays statistics such as:
 .	Total reservations
 .	Room occupancy rate
 .	Revenue
•	Reports can be filtered by time period.

