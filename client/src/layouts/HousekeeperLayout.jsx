import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function HousekeeperLayout() {
  return (
    <div className="min-h-screen bg-brand-light">
      <Navbar title="Reservio Housekeeping" />
      <main className="p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default HousekeeperLayout;
