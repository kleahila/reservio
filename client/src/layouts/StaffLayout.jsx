import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import CommandBar from "../components/CommandBar";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import NotificationBell from "../components/NotificationBell";
import { useAuth } from "../hooks/useAuth";
import { clockIn, clockOut, getMyShifts, getLastHandover } from "../api/shifts";

function AmbientClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs tabular-nums text-rv-muted">
      {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
    </span>
  );
}

function useAmbientMode() {
  useEffect(() => {
    function apply() {
      const h = new Date().getHours();
      let color   = "transparent";
      let opacity = "0";
      if (h >= 6  && h < 12) { color = "rgba(255, 210, 120, 1)"; opacity = "0.025"; }
      if (h >= 18 && h < 21) { color = "rgba(198,  93,  59, 1)"; opacity = "0.030"; }
      if (h >= 21 || h < 6)  { color = "rgba( 30,  50,  90, 1)"; opacity = "0.045"; }
      const el = document.getElementById("rv-ambient");
      if (el) {
        el.style.backgroundColor = color;
        el.style.opacity = opacity;
      }
    }
    apply();
    const t = setInterval(apply, 60_000);
    return () => clearInterval(t);
  }, []);
}

const NAV_LINKS = [
  { to: "/staff/dashboard",    label: "Command Center" },
  { to: "/staff/reservations", label: "Reservations"   },
  { to: "/staff/checkin",      label: "Check-In"       },
  { to: "/staff/checkout",     label: "Check-Out"      },
  { to: "/staff/room-status",  label: "Room Status"    },
  { to: "/staff/housekeeping", label: "Housekeeping"   },
];

export default function StaffLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [openShift, setOpenShift] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState('');
  const [handover, setHandover] = useState(null);
  const [hotelName, setHotelName] = useState(
    () => localStorage.getItem('rv_tenant_name') || ''
  );
  useAmbientMode();

  useEffect(() => {
    if (hotelName) return;
    const subdomain = localStorage.getItem('rv_tenant') || 'grandtirana';
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/public/tenants`)
      .then((r) => r.json())
      .then((tenants) => {
        const match = (tenants || []).find((t) => t.subdomain === subdomain);
        if (match?.name) {
          localStorage.setItem('rv_tenant_name', match.name);
          setHotelName(match.name);
        }
      })
      .catch(() => {});
  }, [hotelName]);

  useEffect(() => {
    getMyShifts()
      .then((shifts) => {
        const open = (shifts || []).find((s) => !s.clockOut);
        setOpenShift(open ?? null);
      })
      .catch(() => {});
    getLastHandover()
      .then((shift) => { if (shift?.note) setHandover(shift); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(true); }
      if (e.key === "/" && e.target === document.body) { e.preventDefault(); setCmdOpen(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function handleLogout() { logout(); navigate("/login"); }

  function handleClockClick() {
    if (openShift) { setNote(''); setShowNoteModal(true); }
    else doClockIn();
  }

  async function doClockIn() {
    setClockLoading(true);
    try { const s = await clockIn(); setOpenShift(s); }
    catch { /* ignore */ }
    finally { setClockLoading(false); }
  }

  async function doClockOut() {
    setClockLoading(true);
    setShowNoteModal(false);
    try { await clockOut(note); setOpenShift(null); setNote(''); }
    catch { /* ignore */ }
    finally { setClockLoading(false); }
  }

  const linkClass = ({ isActive }) =>
    [
      "text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all duration-150",
      isActive
        ? "text-rv-olive bg-rv-olive/10 font-semibold"
        : "text-rv-muted hover:text-rv-text hover:bg-rv-surface2",
    ].join(" ");

  return (
    <div className="flex min-h-screen flex-col bg-rv-bg">
      <header className="flex h-12 shrink-0 items-center gap-4 border-b border-rv-border bg-rv-surface/80 backdrop-blur-sm px-5 z-30">
        <div className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
               style={{ background: "rgba(115, 138, 62, 0.15)" }}>
            <span className="text-[10px] font-bold text-rv-olive">H</span>
          </div>
          <span className="font-serif text-[13px] font-semibold text-rv-text tracking-wide whitespace-nowrap">
            {hotelName || 'Hotel'}
          </span>
        </div>

        <nav className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkClass}>{label}</NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <AmbientClock />

          <button
            onClick={handleClockClick}
            disabled={clockLoading}
            className={`rounded-lg border px-3 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
              openShift
                ? "border-rv-danger/40 bg-rv-danger-soft text-rv-danger hover:bg-rv-danger/10"
                : "border-rv-olive-400/40 bg-rv-olive-50 text-rv-olive-700 hover:bg-rv-olive-100 dark:bg-rv-olive-900/30 dark:text-rv-olive-300"
            }`}
          >
            {openShift ? "Clock Out" : "Clock In"}
          </button>

          <NotificationBell />

          <button
            onClick={() => setCmdOpen(true)}
            className="hidden sm:flex items-center gap-2 text-[11px] text-rv-subtle
                       border border-rv-border rounded-md px-2.5 py-1 transition-all
                       hover:text-rv-text hover:border-rv-border2 hover:bg-rv-surface2"
          >
            <span>Search</span>
            <kbd className="text-[9px] bg-rv-surface2 border border-rv-border px-1.5 py-0.5 rounded leading-none">⌘K</kbd>
          </button>

          <ThemeToggle compact />

          <button
            onClick={handleLogout}
            className="rounded-lg border border-rv-border2 px-2.5 py-1 text-[11px] font-medium text-rv-muted transition hover:border-rv-danger/40 hover:text-rv-danger"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <div id="rv-ambient" className="rv-ambient" />
      {cmdOpen && <CommandBar onClose={() => setCmdOpen(false)} />}

      {handover && (
        <div className="fixed bottom-16 left-1/2 z-40 -translate-x-1/2 w-full max-w-md px-4">
          <div className="rounded-xl border border-rv-olive/30 bg-rv-surface shadow-lg px-4 py-3 flex items-start gap-3">
            <span className="mt-0.5 text-rv-olive text-[15px]">📋</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-rv-olive mb-0.5">
                Handover note from {handover.user?.fullName ?? 'previous shift'}
              </p>
              <p className="text-[12px] text-rv-text leading-snug">{handover.note}</p>
            </div>
            <button onClick={() => setHandover(null)} className="text-rv-muted hover:text-rv-text text-[14px] shrink-0">✕</button>
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-rv-border bg-rv-surface p-6 shadow-xl">
            <h3 className="mb-4 font-semibold text-rv-text">Clock Out — Handover Note</h3>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional handover note for the next shift…"
              className="w-full rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2.5 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-olive-400/40 resize-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowNoteModal(false)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
              <button onClick={doClockOut} disabled={clockLoading} className="rounded-lg bg-rv-danger px-4 py-2 text-sm font-semibold text-white hover:bg-rv-danger/90 disabled:opacity-50">
                {clockLoading ? 'Clocking out…' : 'Clock Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
