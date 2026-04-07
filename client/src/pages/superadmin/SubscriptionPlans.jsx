import { useNavigate } from "react-router-dom";

const PLANS = [
  {
    id: 1,
    name: "Basic",
    monthlyPrice: 49,
    maxRooms: 25,
    color: "bg-slate-100 border-slate-300 text-slate-800",
    badge: "bg-slate-200 text-slate-700",
    features: [
      "Up to 25 rooms",
      "Guest portal",
      "Reservations management",
      "Basic reporting",
      "Email support",
    ],
  },
  {
    id: 2,
    name: "Premium",
    monthlyPrice: 99,
    maxRooms: 80,
    color: "bg-blue-50 border-blue-300 text-blue-900",
    badge: "bg-blue-100 text-blue-800",
    features: [
      "Up to 80 rooms",
      "Everything in Basic",
      "Dynamic pricing engine",
      "Analytics dashboard",
      "Parking & sunbed management",
      "Priority support",
    ],
  },
  {
    id: 3,
    name: "Custom",
    monthlyPrice: null,
    maxRooms: "Unlimited",
    color: "bg-amber-50 border-amber-300 text-amber-900",
    badge: "bg-amber-100 text-amber-800",
    features: [
      "Unlimited rooms",
      "Everything in Premium",
      "White-label portal",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
    ],
  },
];

function SubscriptionPlans() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-primary">
          Subscription Plans
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of available Reservio plan tiers. To change a tenant&apos;s
          plan, use the{" "}
          <button
            onClick={() => navigate("/superadmin/tenants")}
            className="font-medium text-brand-accent underline hover:no-underline"
          >
            Tenant Management
          </button>{" "}
          page.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border-2 p-6 ${plan.color}`}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${plan.badge}`}
                >
                  {plan.name}
                </span>
                <div className="mt-3">
                  {plan.monthlyPrice ? (
                    <div>
                      <span className="text-3xl font-bold">
                        ${plan.monthlyPrice}
                      </span>
                      <span className="ml-1 text-sm opacity-70">/ month</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold">Contact us</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4 border-t border-current/10 pt-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-60">
                Max Rooms
              </p>
              <p className="text-lg font-bold">{plan.maxRooms}</p>
            </div>

            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-current opacity-60">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Plan changes take effect immediately. Contact support for Custom plan
        pricing.
      </p>
    </div>
  );
}

export default SubscriptionPlans;
