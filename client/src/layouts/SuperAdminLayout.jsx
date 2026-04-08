import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function SuperAdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-300 bg-brand-primary px-6 py-3 text-sm font-semibold text-white">
        admin.reservio.com
      </header>
      <div className="flex">
        <Sidebar
          dark
          title="Super Admin"
          sections={[
            { to: "/superadmin/tenants", label: "Tenants" },
            { to: "/superadmin/analytics", label: "Analytics" },
            { to: "/superadmin/onboard", label: "Onboard" },
            { to: "/superadmin/plans", label: "Plans" },
            { to: "/staff/dashboard", label: "Staff Dashboard" },
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

export default SuperAdminLayout;
