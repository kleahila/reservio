import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiCall } from "../api/client";

const FEATURES = [
  {
    title: "Multi-tenant",
    body: "Each hotel operates in its own isolated workspace. One platform, unlimited properties.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="7" height="7" rx="1" /><rect x="15" y="3" width="7" height="7" rx="1" />
        <rect x="2" y="14" width="7" height="7" rx="1" /><rect x="15" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: "Dynamic Pricing",
    body: "Automatically adjust room rates when occupancy crosses your threshold. Revenue on autopilot.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    title: "Housekeeping Queue",
    body: "Priority-ranked cleaning tasks auto-generated on checkout. No more clipboards.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: "Amenity Maps",
    body: "Interactive parking and sunbed maps so guests can self-reserve without calling the front desk.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="10" r="3" /><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      </svg>
    ),
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    features: ['Up to 20 rooms', 'Staff portal', 'Basic analytics', 'Email support'],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '$149',
    period: '/month',
    features: ['Unlimited rooms', 'All portals + technician', 'Dynamic pricing', 'Maintenance board', 'Priority support'],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Everything in Premium', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee'],
    cta: 'Contact sales',
    highlight: false,
  },
];

export default function Landing() {
  const [hotels, setHotels] = useState([]);
  const [showDemo, setShowDemo] = useState(null);

  useEffect(() => {
    apiCall('GET', '/api/public/tenants', undefined, false)
      .then((data) => {
        const sorted = (data || []).sort((a, b) => {
          if (a.plan === 'PREMIUM' && b.plan !== 'PREMIUM') return -1;
          if (b.plan === 'PREMIUM' && a.plan !== 'PREMIUM') return 1;
          return 0;
        });
        setHotels(sorted);
      })
      .catch(() => {});
  }, []);

  function selectHotel(subdomain) {
    localStorage.setItem('rv_tenant', subdomain);
  }

  return (
    <div className="min-h-screen bg-rv-bg">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-rv-border bg-rv-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <span className="text-lg font-bold tracking-tight text-rv-text">Reservio</span>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-4 py-1.5 text-sm font-medium text-rv-muted transition hover:text-rv-text"
            >
              Login
            </Link>
            <Link
              to="/hotel-signup"
              className="rounded-lg bg-rv-accent px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-rv-accent/90"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-24 md:px-6 md:py-32">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center rounded-full border border-rv-accent/20 bg-rv-accent-soft px-3 py-1 text-xs font-semibold text-rv-accent">
            Multi-tenant hotel SaaS platform
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-rv-text md:text-6xl">
            Hotel management,<br />
            <span className="text-rv-accent">reimagined.</span>
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-rv-muted">
            One platform for every property. Reservio gives hotel owners, staff, and guests
            a unified experience — from booking to checkout, from pricing to housekeeping.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/rooms"
              className="rounded-lg bg-rv-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-rv-accent/90"
            >
              Book a room
            </Link>
            <Link
              to="/hotel-signup"
              className="rounded-lg border border-rv-border2 bg-rv-surface px-6 py-3 text-sm font-semibold text-rv-text transition hover:bg-rv-surface2"
            >
              Hotel owner? Get started
            </Link>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-rv-border bg-rv-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-rv-accent">
            Platform features
          </h2>
          <p className="mb-12 text-2xl font-bold text-rv-text">
            Everything a hotel needs. Nothing it doesn&apos;t.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ title, body, icon }) => (
              <div
                key={title}
                className="rounded-xl border border-rv-border bg-rv-bg p-6 transition hover:border-rv-border2"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-rv-accent-soft text-rv-accent">
                  {icon}
                </div>
                <h3 className="mb-2 font-semibold text-rv-text">{title}</h3>
                <p className="text-sm leading-relaxed text-rv-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse Hotels */}
      {hotels.length > 0 && (
        <section className="border-t border-rv-border">
          <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-rv-accent">Browse Hotels</h2>
            <p className="mb-10 text-2xl font-bold text-rv-text">Find your perfect stay.</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {hotels.map((h) => (
                <div key={h.id} className="rounded-xl border border-rv-border bg-rv-bg p-6 flex flex-col gap-3 transition hover:border-rv-border2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-rv-text">{h.name}</h3>
                      <p className="text-xs text-rv-muted mt-0.5">{h.subdomain}.reservio.com</p>
                    </div>
                    {h.plan === 'PREMIUM' && (
                      <span className="rounded-full bg-rv-warning-soft px-2.5 py-0.5 text-xs font-semibold text-rv-warning">Premium</span>
                    )}
                  </div>
                  {h._count?.rooms != null && (
                    <p className="text-xs text-rv-muted">{h._count.rooms} rooms available</p>
                  )}
                  <Link
                    to="/rooms"
                    onClick={() => selectHotel(h.subdomain)}
                    className="mt-auto inline-block rounded-lg bg-rv-accent px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-rv-accent/90"
                  >
                    Browse rooms
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="border-t border-rv-border bg-rv-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-rv-accent">Pricing</h2>
          <p className="mb-12 text-2xl font-bold text-rv-text">Simple, transparent pricing.</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 flex flex-col gap-4 ${
                  plan.highlight
                    ? 'border-rv-accent bg-rv-accent-soft'
                    : 'border-rv-border bg-rv-bg'
                }`}
              >
                <div>
                  <h3 className="font-bold text-rv-text">{plan.name}</h3>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-bold text-rv-text">{plan.price}</span>
                    {plan.period && <span className="text-sm text-rv-muted mb-1">{plan.period}</span>}
                  </div>
                </div>
                <ul className="flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-rv-muted">
                      <svg className="mt-0.5 shrink-0 text-rv-accent" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowDemo(plan.name)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    plan.highlight
                      ? 'bg-rv-accent text-white hover:bg-rv-accent/90'
                      : 'border border-rv-border2 text-rv-text hover:bg-rv-surface2'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing demo modal */}
      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-rv-border bg-rv-surface p-6 shadow-xl">
            <h3 className="mb-2 font-semibold text-rv-text">{showDemo} Plan</h3>
            <p className="mb-4 text-sm text-rv-muted">
              This is a demo platform. To get started with <strong>{showDemo}</strong>, use the hotel signup form.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDemo(null)} className="flex-1 rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Close</button>
              <Link to="/hotel-signup" onClick={() => setShowDemo(null)} className="flex-1 rounded-lg bg-rv-accent px-4 py-2 text-center text-sm font-semibold text-white hover:bg-rv-accent/90">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CTA strip */}
      <section className="border-t border-rv-border">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-rv-text">Ready to check in?</h2>
          <p className="mb-8 text-rv-muted">
            Browse available rooms and make a reservation in minutes.
          </p>
          <Link
            to="/rooms"
            className="inline-block rounded-lg bg-rv-accent px-8 py-3 text-sm font-semibold text-white transition hover:bg-rv-accent/90"
          >
            Browse rooms
          </Link>
        </div>
      </section>

      <footer className="border-t border-rv-border py-6 text-center text-xs text-rv-muted">
        &copy; {new Date().getFullYear()} Reservio &mdash; Hotel management, reimagined.
      </footer>
    </div>
  );
}
