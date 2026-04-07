import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar title="Reservio Admin" subtitle="Hotel Operations" />
      <div className="flex">
        <Sidebar
          dark
          title="Admin"
          sections={[
            { to: "/admin/rooms", label: "Rooms" },
            { to: "/admin/staff", label: "Staff" },
            { to: "/admin/pricing", label: "Pricing" },
            { to: "/admin/analytics", label: "Analytics" },
            { to: "/admin/parking", label: "Parking" },
          ]}
        />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
