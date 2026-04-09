import { Link } from "react-router-dom";

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      
      {
        
      }
      <div style={{ width: "200px", background: "#eee", padding: "10px" }}>
        <h3>Admin</h3>
        <ul>
          <li><Link to="/admin/rooms">Rooms</Link></li>
          <li><Link to="/admin/staff">Staff</Link></li>
          <li>Pricing</li>
          <li>Analytics</li>
          <li>Parking</li>
        </ul>
      </div>

      {

      }
      <div style={{ flex: 1, padding: "20px" }}>
        
        {/* Header */}
        <h2>Hotel Name</h2>

        {children}
      </div>
    </div>
  );
}