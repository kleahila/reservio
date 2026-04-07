import { useState } from "react";
import Card from "../../components/Card";
import { parkingSpots } from "../../data/parkingSpots";

function ParkingManagement() {
  const [rows] = useState(parkingSpots);

  return (
    <Card title="Parking Management">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2">Spot</th>
              <th className="py-2">Status</th>
              <th className="py-2">Price/Night</th>
              <th className="py-2">Tenant</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-2">{row.label}</td>
                <td className="py-2">{row.status}</td>
                <td className="py-2">${row.pricePerNight}</td>
                <td className="py-2">{row.tenantId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default ParkingManagement;
