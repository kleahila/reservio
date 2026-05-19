import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import NotificationBell from "../components/NotificationBell";
import { useAuth } from "../hooks/useAuth";

export default function GuestLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-rv-bg">
      <header className="sticky top-0 z-40 border-b border-rv-border bg-rv-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="font-serif text-lg font-bold tracking-tight text-rv-text">
            Reservio
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {[
              { to: "/rooms",       label: "Rooms"    },
              { to: "/parking",     label: "Parking"  },
              { to: "/marketplace", label: "Services" },
              { to: "/sunbeds",     label: "Sunbeds"  },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 font-medium transition ${
                    isActive
                      ? "bg-rv-olive-100 text-rv-olive-700 dark:bg-rv-olive-900/40 dark:text-rv-olive-300"
                      : "text-rv-muted hover:text-rv-text"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {user ? (
              <>
                <NavLink
                  to="/guest/profile"
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-1.5 font-medium transition ${
                      isActive ? "bg-rv-olive-100 text-rv-olive-700" : "text-rv-muted hover:text-rv-text"
                    }`
                  }
                >
                  My Profile
                </NavLink>
                <NavLink
                  to="/guest/dashboard"
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-1.5 font-medium transition ${
                      isActive ? "bg-rv-olive-100 text-rv-olive-700" : "text-rv-muted hover:text-rv-text"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="ml-2 rounded-lg border border-rv-border2 px-3 py-1.5 text-sm font-medium text-rv-muted transition hover:border-rv-danger/40 hover:text-rv-danger"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="ml-2 rounded-lg bg-rv-olive-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-rv-olive-700"
              >
                Login
              </NavLink>
            )}

            {user && <NotificationBell />}

            <span className="ml-2">
              <ThemeToggle compact />
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-grow px-4 py-8 md:px-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
