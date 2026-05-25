import { Navigate, Route, Routes } from 'react-router-dom';

// Layouts
import GuestLayout from './layouts/GuestLayout';
import StaffLayout from './layouts/StaffLayout';
import HousekeeperLayout from './layouts/HousekeeperLayout';
import AdminLayout from './layouts/AdminLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';

// Auth
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';

// ── GUEST PORTAL ──────────────────────────────────────────────────────────────
import Landing from './pages/Landing';
import Register from './pages/guest/Register';
import Login from './pages/guest/Login';
import RoomBrowsing from './pages/guest/RoomBrowsing';
import RoomAvailability from './pages/guest/RoomAvailability';
import ReservationFlow from './pages/guest/ReservationFlow';
import RoomDetail from './pages/guest/RoomDetail';
import ParkingMap from './pages/guest/ParkingMap';
import SunbedMap from './pages/guest/SunbedMap';
import Marketplace from './pages/guest/Marketplace';
import Notifications from './pages/guest/Notifications';
import GuestDashboard from './pages/guest/Dashboard';
import Checkout from './pages/guest/Checkout';
import Profile from './pages/guest/Profile';
import HotelSignup from './pages/HotelSignup';

// ── STAFF PORTAL ──────────────────────────────────────────────────────────────
import ReservationDashboard from './pages/staff/ReservationDashboard';
import ReservationList from './pages/staff/ReservationList';
import RoomStatusGrid from './pages/staff/RoomStatusGrid';
import HousekeepingOverride from './pages/staff/HousekeepingOverride';
import CheckIn from './pages/staff/CheckIn';
import CheckOut from './pages/staff/CheckOut';

// ── HOUSEKEEPER PORTAL ────────────────────────────────────────────────────────
import HousekeeperLogin from './pages/housekeeper/HousekeeperLogin';
import TaskBoard from './pages/housekeeper/TaskBoard';

// ── HOTEL ADMIN PORTAL ────────────────────────────────────────────────────────
import AdminLogin from './pages/admin/AdminLogin';
import RoomManagement from './pages/admin/RoomManagement';
import StaffManagement from './pages/admin/StaffManagement';
import DynamicPricing from './pages/admin/DynamicPricing';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import ParkingManagement from './pages/admin/ParkingManagement';
import StaffHours from './pages/admin/StaffHours';
import MaintenanceBoard from './pages/admin/MaintenanceBoard';
import GuestList from './pages/admin/GuestList';
import OccupancyCalendar from './pages/admin/OccupancyCalendar';
import CommandCenter from './pages/admin/CommandCenter';
import SunbedsConfig from './pages/admin/SunbedsConfig';

// ── TECHNICIAN PORTAL ─────────────────────────────────────────────────────────
import TechnicianLayout from './layouts/TechnicianLayout';
import TechnicianTasks from './pages/technician/TechnicianTasks';

// ── SUPER ADMIN PORTAL ────────────────────────────────────────────────────────
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import TenantManagement from './pages/superadmin/TenantManagement';
import SubscriptionPlans from './pages/superadmin/SubscriptionPlans';
import PlatformAnalytics from './pages/superadmin/PlatformAnalytics';
import OnboardHotel from './pages/superadmin/OnboardHotel';
import PlatformStatus from './pages/superadmin/PlatformStatus';
import SuperAdminActivityLog from './pages/superadmin/ActivityLog';

// ── AUTH ──────────────────────────────────────────────────────────────────────
import ForgotPassword from './pages/guest/ForgotPassword';

// ── DEV ───────────────────────────────────────────────────────────────────────
import RoleSwitcher from './pages/dev/RoleSwitcher';

export default function App() {
  return (
    <Routes>
      {/* ── PUBLIC ───────────────────────────────────────────────────────── */}
      <Route path="/" element={<Landing />} />
      <Route path="/hotel-signup" element={<HotelSignup />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Public room browsing */}
      <Route element={<GuestLayout />}>
        <Route path="/rooms" element={<RoomBrowsing />} />
        <Route path="/rooms/availability" element={<RoomAvailability />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
      </Route>

      {/* Legacy login pages — kept public for direct access */}
      <Route path="/staff/login" element={<Navigate to="/login" replace />} />
      <Route path="/housekeeper/login" element={<HousekeeperLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />

      {/* ── GUEST PORTAL ─────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['GUEST']} />}>
        <Route element={<GuestLayout />}>
          <Route path="/reservation/:roomId" element={<ReservationFlow />} />
          <Route path="/guest/checkout"     element={<Checkout />} />
          <Route path="/guest/profile"      element={<Profile />} />
          <Route path="/parking"            element={<ParkingMap />} />
          <Route path="/sunbeds"            element={<SunbedMap />} />
          <Route path="/marketplace"        element={<Marketplace />} />
          <Route path="/notifications"      element={<Notifications />} />
          <Route path="/guest/dashboard"    element={<GuestDashboard />} />
        </Route>
      </Route>

      {/* ── TECHNICIAN PORTAL ────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['TECHNICIAN']} />}>
        <Route path="/technician" element={<TechnicianLayout />}>
          <Route path="tasks" element={<TechnicianTasks />} />
        </Route>
      </Route>

      {/* ── STAFF PORTAL ─────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['STAFF', 'RECEPTIONIST']} />}>
        <Route path="/staff" element={<StaffLayout />}>
          <Route path="dashboard"    element={<ReservationDashboard />} />
          <Route path="reservations" element={<ReservationList />} />
          <Route path="checkin"      element={<CheckIn />} />
          <Route path="checkout"     element={<CheckOut />} />
          <Route path="rooms"        element={<RoomStatusGrid />} />
          <Route path="room-status"  element={<RoomStatusGrid />} />
          <Route path="housekeeping" element={<HousekeepingOverride />} />
        </Route>
      </Route>

      {/* ── HOUSEKEEPER PORTAL ───────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['HOUSEKEEPER']} />}>
        <Route path="/housekeeper" element={<HousekeeperLayout />}>
          <Route path="tasks" element={<TaskBoard />} />
        </Route>
      </Route>

      {/* ── HOTEL ADMIN PORTAL ───────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['HOTEL_ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard"      element={<Navigate to="/admin/command-center" replace />} />
          <Route path="command-center" element={<CommandCenter />} />
          <Route path="rooms"          element={<RoomManagement />} />
          <Route path="staff"          element={<StaffManagement />} />
          <Route path="pricing"        element={<DynamicPricing />} />
          <Route path="analytics"      element={<AnalyticsDashboard />} />
          <Route path="parking"        element={<ParkingManagement />} />
          <Route path="staff-hours"    element={<StaffHours />} />
          <Route path="maintenance"    element={<MaintenanceBoard />} />
          <Route path="guests"         element={<GuestList />} />
          <Route path="calendar"       element={<OccupancyCalendar />} />
          <Route path="sunbeds"        element={<SunbedsConfig />} />
        </Route>
      </Route>

      {/* ── SUPER ADMIN PORTAL ───────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
        <Route path="/superadmin" element={<SuperAdminLayout />}>
          <Route path="tenants"       element={<TenantManagement />} />
          <Route path="subscriptions" element={<SubscriptionPlans />} />
          <Route path="analytics"     element={<PlatformAnalytics />} />
          <Route path="onboard"       element={<OnboardHotel />} />
          <Route path="status"        element={<PlatformStatus />} />
          <Route path="activity"      element={<SuperAdminActivityLog />} />
        </Route>
      </Route>

      {/* ── DEV ──────────────────────────────────────────────────────────── */}
      <Route path="/dev/switcher" element={<RoleSwitcher />} />

      {/* ── Fallback ─────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
