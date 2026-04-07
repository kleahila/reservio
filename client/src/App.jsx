import { Navigate, Route, Routes } from "react-router-dom";
import GuestLayout from "./layouts/GuestLayout";
import StaffLayout from "./layouts/StaffLayout";
import HousekeeperLayout from "./layouts/HousekeeperLayout";
import AdminLayout from "./layouts/AdminLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

import Register from "./pages/guest/Register";
import Login from "./pages/guest/Login";
import Dashboard from "./pages/guest/Dashboard";
import RoomBrowsing from "./pages/guest/RoomBrowsing";
import RoomDetail from "./pages/guest/RoomDetail";
import ParkingMap from "./pages/guest/ParkingMap";
import SunbedMap from "./pages/guest/SunbedMap";
import Marketplace from "./pages/guest/Marketplace";
import Notifications from "./pages/guest/Notifications";

import ReservationDashboard from "./pages/staff/ReservationDashboard";
import RoomStatusGrid from "./pages/staff/RoomStatusGrid";
import HousekeepingOverride from "./pages/staff/HousekeepingOverride";

import TaskBoard from "./pages/housekeeper/TaskBoard";

import RoomManagement from "./pages/admin/RoomManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import DynamicPricing from "./pages/admin/DynamicPricing";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import ParkingManagement from "./pages/admin/ParkingManagement";

import TenantManagement from "./pages/superadmin/TenantManagement";
import SubscriptionPlans from "./pages/superadmin/SubscriptionPlans";
import PlatformAnalytics from "./pages/superadmin/PlatformAnalytics";
import OnboardHotel from "./pages/superadmin/OnboardHotel";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/guest/rooms" replace />} />

      <Route path="/guest" element={<GuestLayout />}>
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rooms" element={<RoomBrowsing />} />
        <Route path="rooms/:id" element={<RoomDetail />} />
        <Route path="parking" element={<ParkingMap />} />
        <Route path="sunbeds" element={<SunbedMap />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="/staff" element={<StaffLayout />}>
        <Route path="reservations" element={<ReservationDashboard />} />
        <Route path="rooms" element={<RoomStatusGrid />} />
        <Route path="housekeeping" element={<HousekeepingOverride />} />
      </Route>

      <Route path="/housekeeper" element={<HousekeeperLayout />}>
        <Route path="tasks" element={<TaskBoard />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route path="rooms" element={<RoomManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="pricing" element={<DynamicPricing />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="parking" element={<ParkingManagement />} />
      </Route>

      <Route path="/superadmin" element={<SuperAdminLayout />}>
        <Route path="tenants" element={<TenantManagement />} />
        <Route path="analytics" element={<PlatformAnalytics />} />
        <Route path="onboard" element={<OnboardHotel />} />
        <Route path="plans" element={<SubscriptionPlans />} />
      </Route>

      <Route path="*" element={<Navigate to="/guest/rooms" replace />} />
    </Routes>
  );
}

export default App;
