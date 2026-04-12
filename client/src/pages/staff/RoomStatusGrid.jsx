import { useState } from "react";

const mockRooms = [
  { id: 1, number: "101", status: "Available" },
  { id: 2, number: "102", status: "Occupied" },
  { id: 3, number: "103", status: "Maintenance" },
];

function RoomStatusGrid() {
  const [rooms, setRooms] = useState(mockRooms);

  const updateStatus = (id, newStatus) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available": return "bg-green-500";
      case "Occupied": return "bg-red-500";
      case "Maintenance": return "bg-yellow-500";
      default: return "bg-gray-300";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Room Status Grid</h1>
      <div className="grid grid-cols-4 gap-4">
        {rooms.map(r => (
          <div key={r.id} className={`p-4 border rounded ${getStatusColor(r.status)} text-white`}>
            <h3>Room {r.number}</h3>
            <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="mt-2 w-full">
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomStatusGrid;
