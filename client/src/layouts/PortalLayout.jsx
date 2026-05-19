import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import NotificationBell from "../components/NotificationBell";
import { useAuth } from "../hooks/useAuth";
import { clockIn, clockOut, getMyShifts } from "../api/shifts";

export default function PortalLayout({ portalName, links, headerTitle, showClockInOut = false }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [openShift, setOpenShift] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!showClockInOut) return;
    getMyShifts()
      .then((shifts) => {
        const open = (shifts || []).find((s) => !s.clockOut);
        setOpenShift(open ?? null);
      })
      .catch(() => {});
  }, [showClockInOut]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleClockButtonClick() {
    if (openShift) {
      setNote('');
      setShowNoteModal(true);
    } else {
      doClockIn();
    }
  }

  async function doClockIn() {
    setClockLoading(true);
    try {
      const shift = await clockIn();
      setOpenShift(shift);
    } catch { /* ignore */ }
    finally { setClockLoading(false); }
  }

  async function doClockOut() {
    setClockLoading(true);
    setShowNoteModal(false);
    try {
      await clockOut(note);
      setOpenShift(null);
      setNote('');
    } catch { /* ignore */ }
    finally { setClockLoading(false); }
  }

  return (
    <div className="flex min-h-screen flex-col bg-rv-bg">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar portalName={portalName} links={links} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-rv-border bg-rv-surface px-6">
            <span className="text-sm font-semibold text-rv-text">
              {headerTitle ?? portalName}
            </span>

            <div className="ml-auto flex items-center gap-2">
              {showClockInOut && (
                <button
                  onClick={handleClockButtonClick}
                  disabled={clockLoading}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                    openShift
                      ? "border-rv-danger/40 bg-rv-danger-soft text-rv-danger hover:bg-rv-danger/10"
                      : "border-rv-olive-400/40 bg-rv-olive-50 text-rv-olive-700 hover:bg-rv-olive-100 dark:bg-rv-olive-900/30 dark:text-rv-olive-300"
                  }`}
                >
                  {openShift ? "Clock Out" : "Clock In"}
                </button>
              )}

              <NotificationBell />

              <ThemeToggle compact />

              <button
                onClick={handleLogout}
                className="rounded-lg border border-rv-border2 px-2.5 py-1.5 text-xs font-medium text-rv-muted transition hover:border-rv-danger/40 hover:text-rv-danger"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />

      {/* Clock-out note modal */}
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
              <button
                onClick={() => setShowNoteModal(false)}
                className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted"
              >
                Cancel
              </button>
              <button
                onClick={doClockOut}
                disabled={clockLoading}
                className="rounded-lg bg-rv-danger px-4 py-2 text-sm font-semibold text-white hover:bg-rv-danger/90 disabled:opacity-50"
              >
                {clockLoading ? 'Clocking out…' : 'Clock Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
