import { useState } from "react";

export default function StaffPage() {
  const [staff, setStaff] = useState([
    { id: 1, name: "John", email: "john@test.com", role: "Staff", active: true },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "Staff",
  });

  const addStaff = () => {
    setStaff([...staff, { ...newStaff, id: Date.now(), active: true }]);
    setShowModal(false);
  };

  const toggleActive = (id) => {
    setStaff(
      staff.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s
      )
    );
  };

  return (
    <div>
      <h3>Staff</h3>

      <button onClick={() => setShowModal(true)}>Add Staff</button>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.role}</td>
              <td>
                <button onClick={() => toggleActive(s.id)}>
                  {s.active ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {
        
      }
      {showModal && (
        <div style={{ background: "#ccc", padding: "10px" }}>
          <h4>Add Staff</h4>
          <input placeholder="Name" onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} />
          <input placeholder="Email" onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} />
          
          <select onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}>
            <option>Staff</option>
            <option>Housekeeper</option>
          </select>

          <button onClick={addStaff}>Save</button>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}