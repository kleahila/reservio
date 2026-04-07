import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function GuestLayout() {
  return (
    <div className="min-h-screen bg-brand-light" style={{ minWidth: "375px" }}>
      <Navbar
        title="Reservio Guest"
        links={[
          { to: "/guest/rooms", label: "Rooms" },
          { to: "/guest/parking", label: "Parking" },
          { to: "/guest/marketplace", label: "Services" },
        ]}
      />
      <main className="mx-auto w-full max-w-5xl p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default GuestLayout;
