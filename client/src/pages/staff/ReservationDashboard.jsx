import { useState } from "react";
import toast from "react-hot-toast";

const mockReservations = [
  { id: 1, guest: "John Doe", room: "101", dates: "2026-04-10 to 2026-04-12", status: "Pending" },
  { id: 2, guest: "Jane Smith", room: "102", dates: "2026-04-08 to 2026-04-09", status: "Confirmed" },
  { id: 3, guest: "Alice Brown", room: "103", dates: "2026-04-08 to 2026-04-10", status: "CheckedIn" },
];

function ReservationDashboard() {
  const [reservations, setReservations] = useState(mockReservations);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredReservations = reservations.filter(r =>
    (!filterDate || r.dates.includes(filterDate)) &&
    (!filterStatus || r.status === filterStatus)
  );

  const confirmReservation = (id) => {
    setReservations(reservations.map(r => r.id === id ? { ...r, status: "Confirmed" } : r));
    toast.success("Reservation confirmed!");
  };

  const checkIn = (id) => {
    setReservations(reservations.map(r => r.id === id ? { ...r, status: "CheckedIn" } : r));
    toast.success("Checked in!");
  };

  const checkOut = (id) => {
    setReservations(reservations.map(r => r.id === id ? { ...r, status: "CheckedOut" } : r));
    toast.success("Housekeeping task created!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-amber-500";
      case "Confirmed": return "bg-green-500";
      case "CheckedIn": return "bg-blue-500";
      case "CheckedOut": return "bg-gray-500";
      default: return "bg-gray-300";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reservation Dashboard</h1>
      <div className="mb-4 flex gap-4">
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border p-2" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border p-2">
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="CheckedIn">CheckedIn</option>
          <option value="CheckedOut">CheckedOut</option>
        </select>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Guest</th>
            <th className="border p-2">Room</th>
            <th className="border p-2">Dates</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredReservations.map(r => (
            <tr key={r.id}>
              <td className="border p-2">{r.guest}</td>
              <td className="border p-2">{r.room}</td>
              <td className="border p-2">{r.dates}</td>
              <td className="border p-2"><span className={`px-2 py-1 text-white rounded ${getStatusColor(r.status)}`}>{r.status}</span></td>
              <td className="border p-2">
                {r.status === "Pending" && <button onClick={() => confirmReservation(r.id)} className="bg-blue-500 text-white px-2 py-1 rounded">Confirm</button>}
                {r.status === "Confirmed" && <button onClick={() => checkIn(r.id)} className="bg-green-500 text-white px-2 py-1 rounded">Check-In</button>}
                {r.status === "CheckedIn" && <button onClick={() => checkOut(r.id)} className="bg-red-500 text-white px-2 py-1 rounded">Check-Out</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReservationDashboard;
