import { useState } from "react";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import { users } from "../../data/users";

function StaffManagement() {
  const [rows] = useState(
    users.filter((user) =>
      ["staff", "housekeeper", "admin"].includes(user.role),
    ),
  );

  return (
    <Card title="Staff Management">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-2">{row.fullName}</td>
                <td className="py-2">{row.email}</td>
                <td className="py-2">{row.role}</td>
                <td className="py-2">
                  <StatusBadge status={row.active ? "Active" : "Inactive"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default StaffManagement;
