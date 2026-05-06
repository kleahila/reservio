import { Navigate, Route, Routes, useLocation } from "react-router-dom";

// Layouts
import GuestLayout from "./layouts/GuestLayout";
import StaffLayout from "./layouts/StaffLayout";
import HousekeeperLayout from "./layouts/HousekeeperLayout";
import AdminLayout from "./layouts/AdminLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

// ── GUEST PORTAL ──────────────────────────────────────────────────────────────
import Landing from "./pages/Landing";
import Register from "./pages/guest/Register";
import Login from "./pages/guest/Login";
import RoomBrowsing from "./pages/guest/RoomBrowsing";
import RoomAvailability from "./pages/guest/RoomAvailability";
import ReservationFlow from "./pages/guest/ReservationFlow";
import RoomDetail from "./pages/guest/RoomDetail";
import ParkingMap from "./pages/guest/ParkingMap";
import SunbedMap from "./pages/guest/SunbedMap";
import Marketplace from "./pages/guest/Marketplace";
import Notifications from "./pages/guest/Notifications";
import GuestDashboard from "./pages/guest/Dashboard";
import HotelSignup from "./pages/HotelSignup";

// ── STAFF PORTAL ──────────────────────────────────────────────────────────────
import StaffLogin from "./pages/staff/StaffLogin";
import ReservationDashboard from "./pages/staff/ReservationDashboard";
import ReservationList from "./pages/staff/ReservationList";
import RoomStatusGrid from "./pages/staff/RoomStatusGrid";
import HousekeepingOverride from "./pages/staff/HousekeepingOverride";

// ── HOUSEKEEPER PORTAL ────────────────────────────────────────────────────────
import HousekeeperLogin from "./pages/housekeeper/HousekeeperLogin";
import TaskBoard from "./pages/housekeeper/TaskBoard";

// ── HOTEL ADMIN PORTAL ────────────────────────────────────────────────────────
import AdminLogin from "./pages/admin/AdminLogin";
import RoomManagement from "./pages/admin/RoomManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import DynamicPricing from "./pages/admin/DynamicPricing";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import ParkingManagement from "./pages/admin/ParkingManagement";

// ── SUPER ADMIN PORTAL ────────────────────────────────────────────────────────
import SuperAdminLogin from "./pages/superadmin/SuperAdminLogin";
import TenantManagement from "./pages/superadmin/TenantManagement";
import SubscriptionPlans from "./pages/superadmin/SubscriptionPlans";
import PlatformAnalytics from "./pages/superadmin/PlatformAnalytics";
import OnboardHotel from "./pages/superadmin/OnboardHotel";

// ── DEV ───────────────────────────────────────────────────────────────────────
import RoleSwitcher from "./pages/dev/RoleSwitcher";

// ── Mock auth guard ───────────────────────────────────────────────────────────
// Reads rv-role from localStorage. If the required role is missing, redirects to
// the appropriate login page. This is intentionally lightweight — no real auth.
function RequireRole({ role, loginPath, children }) {
  const current = localStorage.getItem("rv-role");
  if (current !== role) {
    return <Navigate to={loginPath} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* ── GUEST PORTAL ─────────────────────────────────────────────────── */}
      <Route path="/" element={<Landing />} />
      <Route path="/hotel-signup" element={<HotelSignup />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route element={<GuestLayout />}>
        <Route path="/rooms" element={<RoomBrowsing />} />
        <Route path="/rooms/availability" element={<RoomAvailability />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/reservation/:roomId" element={<ReservationFlow />} />
        <Route path="/parking" element={<ParkingMap />} />
        <Route path="/sunbeds" element={<SunbedMap />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/guest/dashboard" element={<GuestDashboard />} />
      </Route>

      {/* ── STAFF PORTAL ─────────────────────────────────────────────────── */}
      <Route path="/staff/login" element={<StaffLogin />} />
      <Route
        path="/staff"
        element={
          <RequireRole role="staff" loginPath="/staff/login">
            <StaffLayout />
          </RequireRole>
        }
      >
        <Route path="dashboard"    element={<ReservationDashboard />} />
        <Route path="reservations" element={<ReservationList />} />
        <Route path="rooms"        element={<RoomStatusGrid />} />
        <Route path="housekeeping" element={<HousekeepingOverride />} />
      </Route>

      {/* ── HOUSEKEEPER PORTAL ───────────────────────────────────────────── */}
      <Route path="/housekeeper/login" element={<HousekeeperLogin />} />
      <Route
        path="/housekeeper"
        element={
          <RequireRole role="housekeeper" loginPath="/housekeeper/login">
            <HousekeeperLayout />
          </RequireRole>
        }
      >
        <Route path="tasks" element={<TaskBoard />} />
      </Route>

      {/* ── HOTEL ADMIN PORTAL ───────────────────────────────────────────── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireRole role="admin" loginPath="/admin/login">
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route path="rooms"     element={<RoomManagement />} />
        <Route path="staff"     element={<StaffManagement />} />
        <Route path="pricing"   element={<DynamicPricing />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="parking"   element={<ParkingManagement />} />
      </Route>

      {/* ── SUPER ADMIN PORTAL ───────────────────────────────────────────── */}
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route
        path="/superadmin"
        element={
          <RequireRole role="superadmin" loginPath="/superadmin/login">
            <SuperAdminLayout />
          </RequireRole>
        }
      >
        <Route path="tenants"       element={<TenantManagement />} />
        <Route path="subscriptions" element={<SubscriptionPlans />} />
        <Route path="analytics"     element={<PlatformAnalytics />} />
        <Route path="onboard"       element={<OnboardHotel />} />
      </Route>

      {/* ── DEV ──────────────────────────────────────────────────────────── */}
      <Route path="/dev/switcher" element={<RoleSwitcher />} />

      {/* ── Fallback ─────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
