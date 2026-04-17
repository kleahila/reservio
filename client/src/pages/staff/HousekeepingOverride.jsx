// HousekeepingOverride — Staff housekeeping dispatch view
// Full task schedule with per-staff filter and urgency override (brief §4)

import { mockTasks } from "../../data/mockTasks";
import { mockStaff }  from "../../data/mockStaff";
import TaskStack from "../../components/TaskStack";

export default function HousekeepingOverride() {
  return (
    <div className="p-6 md:p-8">
      <TaskStack
        tasks={mockTasks}
        staff={mockStaff}
        title="Housekeeping Priority"
        showStaffFilter={true}
      />
    </div>
  );
}
