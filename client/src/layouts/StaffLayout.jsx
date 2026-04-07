import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function StaffLayout() {
  return (
    <div className="min-h-screen bg-brand-light">
      <Navbar title="Reservio Staff" />
      <div className="flex">
        <Sidebar
          title="Staff"
          sections={[
            { to: "/staff/reservations", label: "Reservations" },
            { to: "/staff/rooms", label: "Room Status" },
            { to: "/staff/housekeeping", label: "Housekeeping" },
          ]}
        />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StaffLayout;
