// Mediterranean Hotel Command Center — Staff Dashboard
// Layout: Left panel | Floor map | Keycard panel (slide-in) / Bottom timeline

import { useState, useMemo } from "react";
import { mockRooms }        from "../../data/mockRooms";
import { mockReservations } from "../../data/mockReservations";
import { mockTasks }        from "../../data/mockTasks";
import { mockStaff }        from "../../data/mockStaff";

import LeftCommandPanel from "../../components/LeftCommandPanel";
import HotelFloorMap    from "../../components/HotelFloorMap";
import KeycardPanel     from "../../components/KeycardPanel";
import BookingTimeline  from "../../components/BookingTimeline";

export default function CommandCenter() {
  const [rooms,        setRooms]        = useState(mockRooms);
  const [reservations, setReservations] = useState(mockReservations);
  const [selectedId,   setSelectedId]   = useState(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // ── Selected room / reservation ───────────────────────────────────────
  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedId) ?? null,
    [rooms, selectedId],
  );

  const selectedReservation = useMemo(() => {
    if (!selectedId) return null;
    // Prefer active (checked-in) or upcoming reservation for the room
    return (
      reservations.find(
        (r) =>
          r.roomId === selectedId &&
          r.status !== "CheckedOut" &&
          r.checkIn <= today &&
          r.checkOut >= today,
      ) ??
      reservations.find(
        (r) => r.roomId === selectedId && r.status !== "CheckedOut",
      ) ??
      null
    );
  }, [reservations, selectedId, today]);

  // ── State handlers ────────────────────────────────────────────────────
  function handleRoomSelect(id) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function handleRoomStatusChange(roomId, newStatus) {
    setRooms((rs) => rs.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r)));
  }

  function handleReservationTransition(id, next) {
    setReservations((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
    // If checking out, sync room to Cleaning
    if (next === "CheckedOut") {
      const res = reservations.find((r) => r.id === id);
      if (res) handleRoomStatusChange(res.roomId, "Cleaning");
    }
  }

  function handleTimelineUpdate(id, updates) {
    setReservations((rs) => rs.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }

  const activeStaff = useMemo(() => mockStaff.filter((s) => s.status === "Active"), []);
  const openTasks   = useMemo(() => mockTasks.filter((t) => t.status !== "Cleaned"), []);

  return (
    // Fill the full height of the StaffLayout <main> (viewport - 48px nav)
    <div
      className="flex flex-col overflow-hidden bg-rv-bg"
      style={{ height: "calc(100dvh - 3rem)" }}
    >
      {/* ── Three-panel main area ──────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Left — alerts, arrivals, staff */}
        <LeftCommandPanel
          reservations={reservations}
          tasks={openTasks}
          staff={activeStaff}
        />

        {/* Center — hotel floor map (primary interface) */}
        <div className="flex-1 overflow-auto">
          <HotelFloorMap
            rooms={rooms}
            reservations={reservations}
            selectedRoomId={selectedId}
            onRoomClick={handleRoomSelect}
          />
        </div>

        {/* Right — keycard panel (slides in when a room is selected) */}
        {selectedRoom && (
          <KeycardPanel
            room={selectedRoom}
            reservation={selectedReservation}
            onClose={() => setSelectedId(null)}
            onStatusChange={handleRoomStatusChange}
            onReservationTransition={handleReservationTransition}
          />
        )}
      </div>

      {/* ── Bottom — booking timeline ─────────────────────────────────── */}
      <BookingTimeline
        rooms={rooms}
        reservations={reservations}
        onReservationUpdate={handleTimelineUpdate}
        selectedRoomId={selectedId}
        onRoomSelect={handleRoomSelect}
      />
    </div>
  );
}
