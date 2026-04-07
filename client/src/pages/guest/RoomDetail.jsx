import { useState } from "react";
import { useParams } from "react-router-dom";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import { rooms } from "../../data/rooms";

function RoomDetail() {
  const { id } = useParams();
  const [room] = useState(
    () => rooms.find((item) => item.id === Number(id)) || rooms[0],
  );

  return (
    <Card title="Room Detail">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{room.type}</h3>
        <p className="text-sm text-slate-700">{room.description}</p>
        <p className="text-sm">Price: ${room.pricePerNight}/night</p>
        <StatusBadge status={room.status} />
      </div>
    </Card>
  );
}

export default RoomDetail;
