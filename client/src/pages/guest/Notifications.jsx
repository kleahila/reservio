import { useState } from "react";
import Card from "../../components/Card";

const seedNotifications = [
  { id: 1, message: "Your room is ready for check-in.", time: "10 min ago" },
  { id: 2, message: "Spa discount: 20% this afternoon.", time: "1 hr ago" },
  {
    id: 3,
    message: "Shuttle to city center departs at 18:00.",
    time: "3 hr ago",
  },
];

function Notifications() {
  const [items] = useState(seedNotifications);

  return (
    <Card title="Notifications">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className="rounded bg-slate-50 p-3">
            <p>{item.message}</p>
            <p className="text-xs text-slate-500">{item.time}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default Notifications;
