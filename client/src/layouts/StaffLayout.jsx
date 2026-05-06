import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import CommandBar from "../components/CommandBar";
import ThemeToggle from "../components/ThemeToggle";

// ── Ambient clock shown in the top bar ────────────────────────────────────────
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

// ── Apply subtle time-of-day tint to the ambient overlay ──────────────────────
function useAmbientMode() {
  useEffect(() => {
    function apply() {
      const h = new Date().getHours();
      let color   = "transparent";
      let opacity = "0";
      if (h >= 6  && h < 12) { color = "rgba(255, 210, 120, 1)"; opacity = "0.025"; } // morning warm
      if (h >= 18 && h < 21) { color = "rgba(198,  93,  59, 1)"; opacity = "0.030"; } // evening terracotta
      if (h >= 21 || h < 6)  { color = "rgba( 30,  50,  90, 1)"; opacity = "0.045"; } // night blue
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
  { to: "/staff/rooms",        label: "Room Status"    },
  { to: "/staff/housekeeping", label: "Housekeeping"   },
];

export default function StaffLayout() {
  const [cmdOpen, setCmdOpen] = useState(false);
  useAmbientMode();

  // Global keyboard shortcut for command bar
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (e.key === "/" && e.target === document.body) {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const linkClass = ({ isActive }) =>
    [
      "text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all duration-150",
      isActive
        ? "text-rv-accent bg-rv-accent/10 font-semibold"
        : "text-rv-muted hover:text-rv-text hover:bg-rv-surface2",
    ].join(" ");

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-rv-bg">

      {/* ── Mediterranean top navigation ─────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center gap-4 border-b border-rv-border bg-rv-surface/80 backdrop-blur-sm px-5 z-30">

        {/* Hotel brand mark */}
        <div className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
               style={{ background: "rgba(198,93,59,0.15)" }}>
            <span className="text-[10px] font-bold" style={{ color: "rgb(var(--rv-accent))" }}>H</span>
          </div>
          <span className="font-serif text-[13px] font-semibold text-rv-text tracking-wide whitespace-nowrap">
            Grand Hotel
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkClass}>{label}</NavLink>
          ))}
        </nav>

        {/* Right cluster: clock + shortcut hint + theme */}
        <div className="ml-auto flex items-center gap-3">
          <AmbientClock />

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
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* ── Ambient overlay (barely noticeable time-of-day tint) ─────────── */}
      <div id="rv-ambient" className="rv-ambient" />

      {/* ── Command Bar ──────────────────────────────────────────────────── */}
      {cmdOpen && <CommandBar onClose={() => setCmdOpen(false)} />}
    </div>
  );
}
