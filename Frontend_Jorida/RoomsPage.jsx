import { useState } from "react";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([
    { id: 1, type: "Single", price: 100, description: "Small room" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    type: "",
    price: "",
    description: "",
  });

  const addRoom = () => {
    setRooms([...rooms, { ...newRoom, id: Date.now() }]);
    setShowModal(false);
  };

  const deleteRoom = (id) => {
    setRooms(rooms.filter((r) => r.id !== id));
  };

  return (
    <div>
      <h3>Rooms</h3>

      <button onClick={() => setShowModal(true)}>Add Room</button>

      <table border="1">
        <thead>
          <tr>
            <th>Type</th>
            <th>Price</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>{room.type}</td>
              <td>{room.price}</td>
              <td>{room.description}</td>
              <td>
                <button onClick={() => deleteRoom(room.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {
        
      }
      {showModal && (
        <div style={{ background: "#ccc", padding: "10px" }}>
          <h4>Add Room</h4>
          <input placeholder="Type" onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })} />
          <input placeholder="Price" onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })} />
          <input placeholder="Description" onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })} />
          <button onClick={addRoom}>Save</button>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}