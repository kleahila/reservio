import { useState } from "react";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import { rooms } from "../../data/rooms";

function RoomBrowsing() {
  const [roomList] = useState(rooms);

  return (
    <Card title="Room Browsing">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="grid gap-3 sm:grid-cols-2">
        {roomList.map((room) => (
          <div key={room.id} className="rounded border border-slate-200 p-3">
            <h3 className="font-semibold text-brand-primary">{room.type}</h3>
            <p className="text-sm text-slate-600">{room.description}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                ${room.pricePerNight}/night
              </span>
              <StatusBadge status={room.status} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default RoomBrowsing;
