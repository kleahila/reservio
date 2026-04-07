import { useState } from "react";
import Card from "../../components/Card";
import { parkingSpots } from "../../data/parkingSpots";

function ParkingMap() {
  const [spots] = useState(parkingSpots);

  return (
    <Card title="Parking Map">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="grid grid-cols-3 gap-2 text-sm sm:grid-cols-4">
        {spots.map((spot) => (
          <div
            key={spot.id}
            className="rounded border border-slate-200 bg-white p-3 text-center"
          >
            <p className="font-semibold">{spot.label}</p>
            <p className="text-xs text-slate-500">{spot.status}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default ParkingMap;
