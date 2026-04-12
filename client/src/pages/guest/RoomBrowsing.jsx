import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import StatusBadge from "../../components/StatusBadge";
import Badge from "../../components/Badge";
import { rooms } from "../../data/rooms";

function RoomBrowsing() {
  const [roomList] = useState(rooms);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredRooms =
    selectedFilter === "all"
      ? roomList
      : roomList.filter((room) => room.status === selectedFilter);

  const roomTypes = ["all", ...new Set(roomList.map((r) => r.type))];
  const statusTypes = ["all", ...new Set(roomList.map((r) => r.status))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <h1 className="text-3xl font-bold text-brand-primary">Browse Rooms</h1>
        <p className="mt-1 text-slate-600">
          Find the perfect room for your stay. {roomList.length} rooms available.
        </p>
      </Card>

      {/* Filters */}
      <Card title="Filter by Availability">
        <div className="flex flex-wrap gap-2">
          {statusTypes.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedFilter === status
                  ? "bg-brand-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {status === "all" ? "All Rooms" : status}
            </button>
          ))}
        </div>
      </Card>

      {/* Room Grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          {selectedFilter === "all"
            ? "All Rooms"
            : `${selectedFilter} Rooms (${filteredRooms.length})`}
        </h2>
        {filteredRooms.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow transition hover:shadow-lg"
              >
                {/* Photo Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <span className="text-6xl">🛏️</span>
                  <Badge className="absolute top-3 right-3 bg-green-500 text-white font-bold text-sm px-3 py-1">
                    ${room.pricePerNight}/night
                  </Badge>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 flex-1">
                      {room.type}
                    </h3>
                    <StatusBadge status={room.status} />
                  </div>

                  <p className="text-sm text-slate-600 flex-1">
                    {room.description}
                  </p>

                  {/* Features */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="text-center">
                      <span className="text-lg">🛏️</span>
                      <p>Bed</p>
                    </div>
                    <div className="text-center">
                      <span className="text-lg">🚿</span>
                      <p>Bath</p>
                    </div>
                    <div className="text-center">
                      <span className="text-lg">📺</span>
                      <p>TV</p>
                    </div>
                  </div>

                  {/* Button */}
                  <Link to={`/guest/rooms/${room.id}`} className="mt-4">
                    <Button className="w-full" variant={room.status === 'Available' ? 'primary' : 'secondary'}>
                      {room.status === "Available" ? "View Details" : "View Details"}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-lg text-slate-600">No rooms found</p>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomBrowsing;
