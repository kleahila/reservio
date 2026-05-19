import { useState, useEffect } from 'react';
import { apiCall } from '../../api/client';

function colorForOccupancy(pct) {
  if (pct < 40) return 'bg-rv-olive-100 text-rv-olive-800 dark:bg-rv-olive-900/30 dark:text-rv-olive-200';
  if (pct < 70) return 'bg-rv-warning-soft text-rv-warning';
  return 'bg-rv-danger-soft text-rv-danger';
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function OccupancyCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [calData, setCalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiCall('GET', `/api/analytics/calendar?year=${year}&month=${month}`, undefined, true)
      .then((data) => { setCalData(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [year, month]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  // Build grid: find weekday of first day (Mon=0)
  const firstDay = new Date(year, month - 1, 1);
  const startPad = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dataByDay = Object.fromEntries(calData.map((c) => [parseInt(c.date.slice(8, 10)), c]));

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-rv-olive-900 dark:text-rv-olive-100">Occupancy Calendar</h1>
          <p className="mt-1 text-sm text-rv-muted">Daily occupancy for {MONTHS[month - 1]} {year}.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="rounded-lg border border-rv-border2 px-3 py-1.5 text-sm font-medium text-rv-muted hover:text-rv-text">← Prev</button>
          <span className="min-w-[140px] text-center font-semibold text-rv-text">{MONTHS[month - 1]} {year}</span>
          <button onClick={nextMonth} className="rounded-lg border border-rv-border2 px-3 py-1.5 text-sm font-medium text-rv-muted hover:text-rv-text">Next →</button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { label: '< 40% — Low', cls: 'bg-rv-olive-100 text-rv-olive-800 dark:bg-rv-olive-900/30 dark:text-rv-olive-200' },
          { label: '40–70% — Medium', cls: 'bg-rv-warning-soft text-rv-warning' },
          { label: '> 70% — High', cls: 'bg-rv-danger-soft text-rv-danger' },
        ].map(({ label, cls }) => (
          <span key={label} className={`rounded-full px-3 py-1 font-semibold ${cls}`}>{label}</span>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-rv-muted">Loading calendar…</div>
      ) : (
        <div className="rounded-xl border border-rv-border bg-rv-surface p-4 overflow-x-auto">
          <div className="grid grid-cols-7 gap-1 min-w-[560px]">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-bold uppercase tracking-wider text-rv-muted">{d}</div>
            ))}
            {cells.map((day, idx) => {
              if (!day) return <div key={`pad-${idx}`} />;
              const info = dataByDay[day];
              const pct = info?.occupancyPercent ?? 0;
              const count = info?.reservationCount ?? 0;
              return (
                <div key={day} className={`rounded-lg p-2 min-h-[64px] flex flex-col items-center justify-center gap-0.5 ${colorForOccupancy(pct)}`}>
                  <span className="text-sm font-bold">{day}</span>
                  <span className="text-xs font-semibold">{pct}%</span>
                  {count > 0 && <span className="text-[10px] opacity-70">{count} res.</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
