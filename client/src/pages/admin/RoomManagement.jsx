import { useState } from "react";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import { rooms } from "../../data/rooms";

function RoomManagement() {
  const [rows] = useState(rooms);

  return (
    <Card title="Room Management">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2">ID</th>
              <th className="py-2">Type</th>
              <th className="py-2">Tenant</th>
              <th className="py-2">Price</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-2">{row.id}</td>
                <td className="py-2">{row.type}</td>
                <td className="py-2">{row.tenantId}</td>
                <td className="py-2">${row.pricePerNight}</td>
                <td className="py-2">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default RoomManagement;
