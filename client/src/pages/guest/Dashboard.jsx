import { useState } from "react";
import Card from "../../components/Card";
import { reservations } from "../../data/reservations";

function Dashboard() {
  const [items] = useState(reservations.slice(0, 3));

  return (
    <Card title="Guest Dashboard">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className="rounded bg-slate-50 p-3">
            Reservation #{item.id} - {item.guestName} ({item.status})
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default Dashboard;
