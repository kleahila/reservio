import { NavLink } from "react-router-dom";

function Sidebar({ sections = [], title = "Navigation", dark = false }) {
  const wrapperClass = dark
    ? "bg-brand-primary text-white"
    : "bg-white text-slate-800 border-r border-slate-200";

  return (
    <aside className={`w-64 min-h-screen px-4 py-6 ${wrapperClass}`}>
      <h2
        className={`mb-5 text-sm font-semibold uppercase tracking-wide ${dark ? "text-slate-100" : "text-slate-500"}`}
      >
        {title}
      </h2>
      <nav className="flex flex-col gap-2">
        {sections.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition ${
                dark
                  ? isActive
                    ? "bg-white/20 text-white"
                    : "text-slate-100 hover:bg-white/10"
                  : isActive
                    ? "bg-brand-primary text-white"
                    : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
