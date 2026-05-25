// Mediterranean Hotel Command Center — Staff Dashboard
// Layout: Left panel | Floor map | Keycard panel (slide-in) / Bottom timeline

import { useState, useEffect, useMemo } from "react";
import { getRooms, updateRoomStatus } from "../../api/rooms";
import { getReservations, updateReservationStatus } from "../../api/reservations";
import { getTasks } from "../../api/housekeeping";
import { getStaff } from "../../api/staff";

import LeftCommandPanel from "../../components/LeftCommandPanel";
import HotelFloorMap    from "../../components/HotelFloorMap";
import KeycardPanel     from "../../components/KeycardPanel";
import BookingTimeline  from "../../components/BookingTimeline";

export default function CommandCenter() {
  const [rooms,        setRooms]        = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tasks,        setTasks]        = useState([]);
  const [staff,        setStaff]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [selectedId,   setSelectedId]   = useState(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getRooms(undefined, undefined, true),
      getReservations(),
      getTasks(),
      getStaff(),
    ])
      .then(([roomsData, resData, tasksData, staffData]) => {
        if (cancelled) return;
        setRooms(roomsData || []);
        setReservations(resData || []);
        setTasks(tasksData || []);
        setStaff(staffData || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) { setError(err.message); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  // ── Selected room / reservation ───────────────────────────────────────
  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedId) ?? null,
    [rooms, selectedId],
  );

  const selectedReservation = useMemo(() => {
    if (!selectedId) return null;
    return (
      reservations.find(
        (r) =>
          r.roomId === selectedId &&
          r.status !== "CHECKED_OUT" &&
          r.checkIn?.slice(0, 10) <= today &&
          r.checkOut?.slice(0, 10) >= today,
      ) ??
      reservations.find(
        (r) => r.roomId === selectedId && r.status !== "CHECKED_OUT",
      ) ??
      null
    );
  }, [reservations, selectedId, today]);

  // ── State handlers ────────────────────────────────────────────────────
  function handleRoomSelect(id) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function handleRoomStatusChange(roomId, newStatus) {
    updateRoomStatus(roomId, newStatus).catch(() => {});
    setRooms((rs) => rs.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r)));
  }

  function handleReservationTransition(id, next) {
    updateReservationStatus(id, next).catch(() => {});
    setReservations((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
    // If checking out, sync room to Cleaning
    if (next === "CHECKED_OUT") {
      const res = reservations.find((r) => r.id === id);
      if (res) handleRoomStatusChange(res.roomId, "MAINTENANCE");
    }
  }

  function handleTimelineUpdate(id, updates) {
    setReservations((rs) => rs.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }

  const activeStaff = useMemo(() => staff.filter((s) => s.active === true), [staff]);
  const openTasks   = useMemo(() => tasks.filter((t) => t.status === "PENDING"), [tasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-rv-muted text-[13px]">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-rv-danger text-[13px]">
        Failed to load: {error}
      </div>
    );
  }

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
