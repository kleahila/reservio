// TaskBoard — Housekeeper personal daily schedule
// Uses the shared TaskStack vertical time-based layout (brief §4)

import { mockTasks } from "../../data/mockTasks";
import { mockStaff }  from "../../data/mockStaff";
import TaskStack from "../../components/TaskStack";

export default function TaskBoard() {
  return (
    <TaskStack
      tasks={mockTasks}
      staff={mockStaff}
      title="My Schedule"
      showStaffFilter={false}
    />
  );
}
