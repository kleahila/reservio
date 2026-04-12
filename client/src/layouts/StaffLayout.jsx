import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function StaffLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-300 bg-brand-primary px-6 py-3 text-sm font-semibold text-white">
        staff.reservio.com
      </header>
      <div className="flex">
        <Sidebar
          dark
          title="Staff"
          sections={[
            { to: "/staff/dashboard", label: "Dashboard" },
            { to: "/staff/housekeeping", label: "Housekeeping" },
          ]}
        />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StaffLayout;
