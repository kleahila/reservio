export const mockTasks = [
  {
    id: 1,
    roomId: 2,
    floor: 1,
    roomLabel: "Room 101",
    checkOutTime:    "2026-04-17T11:00",
    scheduledTime:   "2026-04-17T09:00",   // 09:00 – 09:45 → conflict with task 2
    duration:        45,                    // minutes
    assignedStaffId: 3,                     // Fatima Nasser
    urgency: "high",
    status: "Pending",
    notes: "Guest checked out early. Extra towels requested.",
  },
  {
    id: 2,
    roomId: 6,
    floor: 2,
    roomLabel: "Room 206",
    checkOutTime:    "2026-04-17T12:00",
    scheduledTime:   "2026-04-17T09:30",   // 09:30 – 10:30 → overlaps task 1 (same staff)
    duration:        60,
    assignedStaffId: 3,
    urgency: "medium",
    status: "Cleaning",
    notes: "",
  },
  {
    id: 3,
    roomId: 3,
    floor: 5,
    roomLabel: "Room 501",
    checkOutTime:    "2026-04-17T10:00",
    scheduledTime:   "2026-04-17T14:00",   // 14:00 – 15:30
    duration:        90,
    assignedStaffId: 4,                     // David Kim
    urgency: "low",
    status: "Pending",
    notes: "VIP checkout — deep clean required.",
  },
  {
    id: 4,
    roomId: 5,
    floor: 1,
    roomLabel: "Room 103",
    checkOutTime:    "2026-04-17T10:00",
    scheduledTime:   "2026-04-17T08:00",   // 08:00 – 08:45 (done)
    duration:        45,
    assignedStaffId: 3,
    urgency: "high",
    status: "Cleaned",
    notes: "",
  },
  {
    id: 5,
    roomId: 4,
    floor: 4,
    roomLabel: "Room 402",
    checkOutTime:    "2026-04-17T12:00",
    scheduledTime:   "2026-04-17T15:30",   // 15:30 – 16:30
    duration:        60,
    assignedStaffId: 3,
    urgency: "low",
    status: "Pending",
    notes: "Maintenance check also needed on AC unit.",
  },
];
