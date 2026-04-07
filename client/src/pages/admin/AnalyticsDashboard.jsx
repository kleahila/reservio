import { useState } from "react";
import Card from "../../components/Card";
import { reservations } from "../../data/reservations";

function AnalyticsDashboard() {
  const [rows] = useState(reservations);

  return (
    <Card title="Analytics Dashboard">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2">Reservation ID</th>
              <th className="py-2">Guest</th>
              <th className="py-2">Status</th>
              <th className="py-2">Tenant</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-2">{row.id}</td>
                <td className="py-2">{row.guestName}</td>
                <td className="py-2">{row.status}</td>
                <td className="py-2">{row.tenantId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default AnalyticsDashboard;
