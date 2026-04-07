import { useState } from "react";
import Card from "../../components/Card";
import { rooms } from "../../data/rooms";

function DynamicPricing() {
  const [rows] = useState(rooms);

  return (
    <Card title="Dynamic Pricing">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2">Room</th>
              <th className="py-2">Base Price</th>
              <th className="py-2">Suggested Weekend Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-2">{row.type}</td>
                <td className="py-2">${row.pricePerNight}</td>
                <td className="py-2">${Math.round(row.pricePerNight * 1.2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default DynamicPricing;
