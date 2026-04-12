/**
 * PageHeader — page title + optional subtitle + optional action button slot
 * Props:
 *   title     string          required
 *   subtitle  string          optional
 *   action    ReactNode       optional — rendered on the right side
 */
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-rv-text">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-rv-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
