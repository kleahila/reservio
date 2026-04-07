import { Link } from "react-router-dom";

function Navbar({ title = "Reservio", subtitle, links = [] }) {
  return (
    <header className="flex w-full items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
      <div>
        <h1 className="text-lg font-semibold text-brand-primary">{title}</h1>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      <nav className="flex items-center gap-3 text-sm">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="font-medium text-brand-accent hover:text-brand-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
