import { useState } from "react";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import { housekeepingTasks } from "../../data/housekeepingTasks";

function TaskBoard() {
  const [rows] = useState(housekeepingTasks);

  return (
    <Card title="Task Board">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2">Room</th>
              <th className="py-2">Floor</th>
              <th className="py-2">Check-Out</th>
              <th className="py-2">Priority</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-2">{row.roomNumber}</td>
                <td className="py-2">{row.floor}</td>
                <td className="py-2">{row.checkOutTime}</td>
                <td className="py-2">
                  <StatusBadge
                    status={row.priority === "urgent" ? "Urgent" : "Pending"}
                  />
                </td>
                <td className="py-2">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default TaskBoard;
