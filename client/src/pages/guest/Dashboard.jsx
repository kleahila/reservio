import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../hooks/useAuth";
import { reservations } from "../../data/reservations";
import { formatDate } from "../../utils/validation";

function Dashboard() {
  const { currentUser } = useAuth();
  const [upcomingReservations] = useState(
    reservations
      .filter((res) => res.status === "Confirmed")
      .slice(0, 3),
  );

  const quickLinks = [
    { to: "/guest/rooms", label: "Browse Rooms", icon: "🛏️" },
    { to: "/guest/parking", label: "Parking", icon: "🚗" },
    { to: "/guest/sunbeds", label: "Sunbeds", icon: "☀️" },
    { to: "/guest/marketplace", label: "Marketplace", icon: "🛍️" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">
              Welcome back, {currentUser?.fullName || "Guest"}! 👋
            </h1>
            <p className="mt-1 text-slate-600">
              {currentUser?.fullName || "Guest user"}, we're glad to have you here.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Links */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Quick Links</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand-primary hover:shadow-md"
            >
              <div className="text-3xl">{link.icon}</div>
              <span className="font-medium text-slate-700 text-center">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Reservations */}
      <Card title="Your Upcoming Reservations">
        {upcomingReservations.length > 0 ? (
          <div className="space-y-3">
            {upcomingReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-start justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      Reservation #{reservation.id}
                    </h3>
                    <StatusBadge status={reservation.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {reservation.guestName}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    <span className="font-medium">Check-in:</span> {formatDate(reservation.checkIn)}
                    {" • "}
                    <span className="font-medium">Check-out:</span> {formatDate(reservation.checkOut)}
                  </p>
                </div>
                <Link
                  to={`/guest/rooms/${reservation.roomId}`}
                  className="text-sm font-medium text-brand-primary hover:text-brand-accent"
                >
                  View Room →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 p-6 text-center">
            <p className="text-slate-600">No upcoming reservations</p>
            <Link to="/guest/rooms">
              <Button variant="secondary" className="mt-3">
                Browse Rooms
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Additional Info */}
      <Card title="Need Help?">
        <div className="space-y-2 text-sm text-slate-600">
          <p>📧 Have questions? Contact support anytime.</p>
          <p>📱 Check your notifications for important updates.</p>
          <p>🔐 Your account is secure with encryption.</p>
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;
