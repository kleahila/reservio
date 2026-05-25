// HousekeepingOverride — Staff housekeeping dispatch view
// Full task schedule with per-staff filter and urgency override (brief §4)

import { useState, useEffect } from "react";
import { getTasks } from "../../api/housekeeping";
import { getStaff }  from "../../api/staff";
import TaskStack from "../../components/TaskStack";

export default function HousekeepingOverride() {
  const [tasks,   setTasks]   = useState([]);
  const [staff,   setStaff]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getTasks(), getStaff()])
      .then(([tasksData, staffData]) => {
        if (cancelled) return;
        setTasks(tasksData || []);
        setStaff(staffData || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) { setError(err.message); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 text-rv-muted text-[13px]">Loading…</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 text-rv-danger text-[13px]">Failed to load: {error}</div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <TaskStack
        tasks={tasks}
        staff={staff}
        title="Housekeeping Priority"
        showStaffFilter={true}
      />
    </div>
  );
}
