# Reservio – Requirements Engineering 


## 1. User Scenarios List

| ID     | Name                              | Description |
|--------|----------------------------------|-------------|
| US-13  | Update Room Status               | Staff: The staff member updates the status of a room to Available, Occupied, or Maintenance so that the change is reflected across the hotel system in real time. |
| US-14  | Override Housekeeping Priority   | Staff: The staff member marks a room’s housekeeping task as urgent so that the housekeeper sees it higher in the task list immediately. |
| US-15  | Manage Hotel Rooms               | Hotel Admin: The hotel administrator adds, edits, or removes room records so that the hotel inventory remains accurate and up to date. |
| US-16  | Manage Staff Accounts            | Hotel Admin: The hotel administrator creates, updates, or deactivates staff accounts and assigns roles so that each employee has the proper permissions. |

---

## 2. User Scenarios Extended

### US-13: Update Room Status

1. Staff logs into the staff dashboard.
2. Staff opens the room status section.
3. System displays the list of rooms for that hotel tenant.
4. Staff selects a room.
5. Staff chooses a new status: Available, Occupied, or Maintenance.
6. System validates the request and updates the room status.
7. System broadcasts the new room status across the tenant in real time.
8. Updated status becomes visible on all relevant staff screens.
9. If the status update is invalid or unauthorized, the system shows an error message.

---

### US-14: Override Housekeeping Priority

1. Staff logs into the staff dashboard.
2. Staff opens the housekeeping or room management section.
3. System displays rooms with active housekeeping tasks.
4. Staff selects a room with an active task.
5. Staff marks the task as urgent.
6. System updates the task priority.
7. System re-sorts the housekeeper task list.
8. System broadcasts the update through WebSocket to connected devices.
9. If the room has no active housekeeping task, the system shows an error and does not apply the override.

---

### US-15: Manage Hotel Rooms

1. Hotel Admin logs into the admin panel.
2. Hotel Admin opens the room management section.
3. System shows the current room inventory for the tenant.
4. Admin chooses to add, edit, or remove a room.
5. For add/edit, admin enters or updates room details such as type, description, price, and photos.
6. System validates the entered data.
7. System saves the change in the tenant’s room inventory.
8. System updates all related tenant views immediately.
9. If required data is missing or invalid, the system shows validation errors.
10. If the admin deletes a room, the system asks for confirmation before removal.

---

### US-16: Manage Staff Accounts

1. Hotel Admin logs into the admin panel.
2. Hotel Admin opens the staff management section.
3. System displays existing staff accounts for that tenant.
4. Admin chooses to create, update, or deactivate a staff account.
5. For creation or update, admin enters staff details and selects a role: Staff or Housekeeper.
6. System validates the data and role assignment.
7. System saves the account changes.
8. Permission changes take effect immediately.
9. If the admin deactivates an account, the system revokes access for that user.
10. If entered data is invalid or incomplete, the system shows validation errors.

---

## 3. Use Cases

---

### UC-13: Update Room Status

**Summary:** Allows a staff member to change the status of a room so that the updated state is immediately visible across the hotel system.

**Dependency:** US-02 / Login. Optional business dependency on reservation handling features US-09 to US-12 because room occupancy may already be influenced by reservation lifecycle. This dependency is an inference from the role workflow and feature grouping in the SRS.

**Actor:** Primary actor: Staff

**Preconditions:**
1. Staff is authenticated.
2. Staff belongs to a valid tenant.
3. Staff has permission to manage room status.
4. The selected room exists in the tenant inventory.

**Description of Main Sequence:**
1. Staff opens the room status management view.
2. System displays all rooms for the current tenant and their current statuses.
3. Staff selects a room.
4. Staff selects one of the allowed statuses: Available, Occupied, Maintenance.
5. System validates the request.
6. System updates the room status in the database.
7. System broadcasts the updated status to other tenant-scoped clients.
8. System confirms the successful update to the staff member.

**Description of Alternative Sequence:**
1. Invalid room selected, where the system shows an error that the room does not exist or is unavailable.
2. Unauthorized action, where the system denies the update and shows an authorization error.
3. Invalid status transition or malformed request, where the system rejects the request and keeps the previous room status unchanged.
4. Real-time broadcast failure, where the status is saved successfully and the system retries or refreshes on next client sync.

**Non-functional requirements:**
1. The room status update should be reflected on connected staff devices in near real time.
2. The interface should clearly distinguish statuses visually.
3. Only authorized tenant staff may change a room’s status.
4. The operation should remain scoped to the current tenant.

**Postconditions:**
1. The room status is updated in the system.
2. Connected tenant users can see the new status.
3. An audit trail entry may be stored for the status change.

---

### UC-14: Override Housekeeping Priority

**Summary:** Allows a staff member to mark a room’s housekeeping task as urgent so that the housekeeper sees it earlier in the task list.

**Dependency:** US-02 / Login, US-20 Receive Auto-Prioritised Task List. Requires an existing housekeeping task for the selected room. This is directly implied by the acceptance criteria and the SRS feature mapping.

**Actor:** Primary actor: Staff. Secondary actor: Housekeeper.

**Preconditions:**
1. Staff is authenticated.
2. Room belongs to the current tenant.
3. Room has an active housekeeping task.
4. Staff has permission to override housekeeping priority.

**Description of Main Sequence:**
1. Staff opens the housekeeping management view.
2. System displays rooms with active housekeeping tasks.
3. Staff selects a room.
4. Staff marks the task as urgent.
5. System validates that an active housekeeping task exists.
6. System updates the priority flag of the task.
7. System re-sorts the housekeeper task list.
8. System broadcasts the updated order to connected housekeeper devices.
9. System confirms the successful priority override.

**Description of Alternative Sequence:**
1. No active housekeeping task exists, where the system shows an error and no priority override is applied.
2. Unauthorized action, where the system denies access and shows an error.
3. WebSocket update fails, where priority is still stored and updated order appears after refresh or reconnect.

**Non-functional requirements:**
1. Task reordering should be visible in near real time on connected housekeeper devices.
2. The urgent flag should be visually clear on the task board.
3. The priority override must be tenant-scoped.
4. The feature should support mobile-first housekeeper views, since housekeepers primarily use phones.

**Postconditions:**
1. The selected housekeeping task is marked urgent.
2. The housekeeper task queue is reordered.
3. Connected devices reflect the new ordering.

---

### UC-15: Manage Hotel Rooms

**Summary:** Allows the hotel administrator to add, edit, or remove room records to maintain correct room inventory.

**Dependency:** US-02 / Login, admin access control. Possible linkage with guest browsing and reservation features because room inventory feeds those modules. That linkage is supported by the feature mapping in the SRS.

**Actor:** Primary actor: Hotel Admin

**Preconditions:**
1. Hotel Admin is authenticated.
2. Hotel Admin belongs to a valid tenant.
3. Hotel Admin has room management permission.

**Description of Main Sequence:**
1. Hotel Admin opens the room inventory management page.
2. System displays all current rooms for the tenant.
3. Admin chooses one action: add, edit, or remove a room.
4. For add/edit, admin enters room details such as type, description, price, and photos.
5. System validates the entered data.
6. System saves the room record changes.
7. System updates the tenant inventory.
8. System reflects the change in all relevant tenant views.
9. System confirms the successful operation.

**Description of Alternative Sequence:**
1. Missing or invalid data, where the system highlights invalid fields and room is not saved until corrected.
2. Duplicate room identifier, where the system rejects the addition and prompts correction.
3. Delete requested for a room with linked future reservations, where the system blocks deletion or requires special handling and admin is informed of the dependency.
4. Upload failure for room photo, where the system saves textual data only or cancels save, depending on your chosen rule.

**Non-functional requirements:**
1. Room inventory updates should propagate across the tenant system without noticeable delay.
2. The form should be usable on desktop and tablet.
3. The system must enforce tenant isolation for all room records.
4. Changes should be auditable.

**Postconditions:**
1. A room record is added, updated, or removed.
2. Tenant inventory remains consistent.
3. Related views show the latest room information.

---

### UC-16: Manage Staff Accounts

**Summary:** Allows the hotel administrator to create, update, and deactivate staff accounts while assigning the appropriate role-based permissions.

**Dependency:** US-02 / Login, role-based access control. Immediate permission application is explicitly stated in the proposal.

**Actor:** Primary actor: Hotel Admin

**Preconditions:**
1. Hotel Admin is authenticated.
2. Hotel Admin belongs to a valid tenant.
3. Hotel Admin has staff management permission.

**Description of Main Sequence:**
1. Hotel Admin opens the staff management page.
2. System displays existing staff accounts for the tenant.
3. Admin chooses to create, update, or deactivate an account.
4. For create/update, admin enters user details.
5. Admin assigns a role: Staff or Housekeeper.
6. System validates the input and permissions.
7. System saves the account changes.
8. System applies the permission changes immediately.
9. System confirms the successful operation.

**Description of Alternative Sequence:**
1. Missing or invalid user data, where the system displays validation errors.
2. Duplicate email or username within the tenant, where the system denies the action.
3. Unauthorized attempt to assign an invalid role, where priority is still stored and updated order appears after refresh or reconnect.
4. Deactivated user is currently logged in, where the system revokes or blocks further access at next authorization check.

**Non-functional requirements:**
1. Permission changes should take effect immediately after save.
2. Staff account management must be restricted to the tenant’s admin only.
3. Sensitive account actions should be logged.
4. The UI should minimize admin error when assigning roles.

**Postconditions:**
1. Staff account is created, updated, or deactivated.
2. Assigned permissions reflect the selected role.
3. Account access state is consistent with the admin’s action.

---

## 4. Functional Requirements

### US-13
- FR-13.1 The system shall allow authenticated staff users to view all rooms within their tenant.
- FR-13.2 The system shall allow staff to set a room status to Available, Occupied, or Maintenance.
- FR-13.3 The system shall validate that the selected room belongs to the current tenant before updating its status.
- FR-13.4 The system shall save the updated room status in the database.
- FR-13.5 The system shall broadcast room status changes to tenant-scoped connected clients.

---

### US-14
- FR-14.1 The system shall allow staff to view rooms with active housekeeping tasks.
- FR-14.2 The system shall allow staff to mark a housekeeping task as urgent.
- FR-14.3 The system shall verify that the selected room has an active housekeeping task before applying the urgent flag.
- FR-14.4 The system shall reorder the housekeeper task list based on updated priority.
- FR-14.5 The system shall send the reordered task list to connected housekeeper devices through real-time updates.

---

### US-15
- FR-15.1 The system shall allow hotel admins to add a new room within their tenant.
- FR-15.2 The system shall allow hotel admins to edit room details including type, description, price, and photos.
- FR-15.3 The system shall allow hotel admins to remove a room from the tenant inventory.
- FR-15.4 The system shall validate required room data before saving changes.
- FR-15.5 The system shall ensure that room inventory changes are visible across tenant views after update.

---

### US-16
- FR-16.1 The system shall allow hotel admins to create staff accounts within their tenant.
- FR-16.2 The system shall allow hotel admins to update existing staff account information.
- FR-16.3 The system shall allow hotel admins to deactivate staff accounts.
- FR-16.4 The system shall allow hotel admins to assign either Staff or Housekeeper role to a staff account.
- FR-16.5 The system shall apply updated permissions immediately after the account changes are saved.

---

## 5. Non-Functional Requirements

---

### US-13 — Update Room Status

- NFR-13.1 The system shall update and display the new room status across all connected staff interfaces within 2 seconds after the change is submitted.
- NFR-13.2 The system shall visually distinguish room statuses (Available, Occupied, Maintenance) using clear labels and color indicators to minimize user confusion.
- NFR-13.3 The system shall ensure that only authenticated staff users within the same tenant can update room statuses.

---

### US-14 — Override Housekeeping Priority

- NFR-14.1 The system shall propagate housekeeping priority changes to all connected housekeeper devices within 2 seconds.
- NFR-14.2 The system shall clearly highlight urgent tasks in the task list using visual indicators (e.g., color or icon).
- NFR-14.3 The system shall ensure that priority changes are persisted immediately and not lost in case of temporary network interruption.

---

### US-15 — Manage Hotel Rooms

- NFR-15.1 The system shall process room creation, updates, or deletion requests within 2 seconds under normal system load.
- NFR-15.2 The system shall provide form validation and clear error messages when room data is missing or invalid.
- NFR-15.3 The system shall restrict room management operations to authorized hotel admin users within the tenant.

---

### US-16 — Manage Staff Accounts

- NFR-16.1 The system shall apply staff account changes (creation, update, deactivation) within 2 seconds, including permission updates.
- NFR-16.2 The system shall enforce role-based access control (RBAC), ensuring that only hotel admins can create, modify, or deactivate staff accounts.
- NFR-16.3 The system shall ensure that staff account changes are consistently stored and immediately reflected across the system.
