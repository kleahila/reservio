import { Link, NavLink } from "react-router-dom";

/**
 * Navbar — guest portal top navigation
 * Props:
 *   links  [{ to, label }]   nav links shown on the right
 */
export default function Navbar({ links = [] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-rv-border bg-rv-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="text-lg font-bold tracking-tight text-rv-text">
          Reservio
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 font-medium transition ${
                  isActive
                    ? "bg-rv-accent-soft text-rv-accent"
                    : "text-rv-muted hover:text-rv-text"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
