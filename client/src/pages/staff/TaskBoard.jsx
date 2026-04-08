import { useState } from "react";
import toast from "react-hot-toast";

const mockTasks = [
  { id: 1, room: "101", floor: "1", checkOut: "2026-04-08", urgent: false },
  { id: 2, room: "102", floor: "1", checkOut: "2026-04-09", urgent: true },
  { id: 3, room: "103", floor: "2", checkOut: "2026-04-10", urgent: false },
];

function TaskBoard() {
  const [tasks, setTasks] = useState(mockTasks.sort((a, b) => b.urgent - a.urgent));

  const toggleUrgent = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, urgent: !t.urgent } : t).sort((a, b) => b.urgent - a.urgent));
  };

  const markCleaned = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.success("Front desk notified!");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Task Board</h1>
      <div className="grid grid-cols-3 gap-4">
        {tasks.map(t => (
          <div key={t.id} className={`p-4 border rounded ${t.urgent ? 'border-red-500' : 'border-gray-300'}`}>
            <h3>Room {t.room} - Floor {t.floor}</h3>
            <p>Check-Out: {t.checkOut}</p>
            {t.urgent && <span className="bg-red-500 text-white px-2 py-1 rounded">Urgent</span>}
            <div className="mt-2 flex gap-2">
              <button onClick={() => toggleUrgent(t.id)} className="bg-yellow-500 text-white px-2 py-1 rounded">Toggle Urgent</button>
              <button onClick={() => markCleaned(t.id)} className="bg-green-500 text-white px-2 py-1 rounded">Mark Cleaned</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskBoard;