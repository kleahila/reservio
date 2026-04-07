import { useState } from "react";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import { reservations } from "../../data/reservations";

function ReservationDashboard() {
  const [rows] = useState(reservations);

  return (
    <Card title="Reservation Dashboard">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2">Guest</th>
              <th className="py-2">Room</th>
              <th className="py-2">Check-In</th>
              <th className="py-2">Check-Out</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-2">{row.guestName}</td>
                <td className="py-2">#{row.roomId}</td>
                <td className="py-2">{row.checkIn}</td>
                <td className="py-2">{row.checkOut}</td>
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

export default ReservationDashboard;
