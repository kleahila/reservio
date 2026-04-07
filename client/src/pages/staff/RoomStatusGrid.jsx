import { useState } from "react";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import { rooms } from "../../data/rooms";

function RoomStatusGrid() {
  const [rows] = useState(rooms);

  return (
    <Card title="Room Status Grid">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2">Room Type</th>
              <th className="py-2">Price/Night</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-2">{row.type}</td>
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

export default RoomStatusGrid;
