import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";

const PLANS = [
  {
    id: 1,
    name: "Basic",
    monthlyPrice: 49,
    maxRooms: 25,
    cardCls: "border-rv-border",
    features: ["Up to 25 rooms", "Guest portal", "Reservations management", "Basic reporting", "Email support"],
  },
  {
    id: 2,
    name: "Premium",
    monthlyPrice: 99,
    maxRooms: 80,
    cardCls: "border-rv-accent/40",
    highlight: true,
    features: ["Up to 80 rooms", "Everything in Basic", "Dynamic pricing engine", "Analytics dashboard", "Parking & sunbed management", "Priority support"],
  },
  {
    id: 3,
    name: "Custom",
    monthlyPrice: null,
    maxRooms: "Unlimited",
    cardCls: "border-rv-warning/40",
    features: ["Unlimited rooms", "Everything in Premium", "White-label portal", "Custom integrations", "Dedicated account manager", "SLA guarantee"],
  },
];

const PLAN_BADGE = {
  Basic:   "bg-rv-surface2 text-rv-muted",
  Premium: "bg-rv-accent-soft text-rv-accent",
  Custom:  "bg-rv-warning-soft text-rv-warning",
};

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader
        title="Subscription Plans"
        subtitle={
          <span>
            Plan tier overview. To change a tenant&apos;s plan, use{" "}
            <button onClick={() => navigate("/superadmin/tenants")}
              className="font-medium text-rv-accent underline hover:no-underline">
              Tenant Management
            </button>.
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div key={plan.id}
            className={`rounded-2xl border-2 bg-rv-surface p-6 ${plan.cardCls} ${plan.highlight ? "ring-1 ring-rv-accent/20" : ""}`}>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${PLAN_BADGE[plan.name]}`}>
                  {plan.name}
                </span>
                <div className="mt-3">
                  {plan.monthlyPrice ? (
                    <div>
                      <span className="text-3xl font-bold text-rv-text">${plan.monthlyPrice}</span>
                      <span className="ml-1 text-sm text-rv-muted">/ month</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-rv-text">Contact us</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4 border-t border-rv-border pt-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rv-muted">Max rooms</p>
              <p className="text-lg font-bold text-rv-text">{plan.maxRooms}</p>
            </div>

            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-rv-muted">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="mt-0.5 shrink-0 text-rv-success">
                    <polyline points="1 7 5 11 13 3" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-rv-muted">
        Plan changes take effect immediately. Contact support for Custom plan pricing.
      </p>
    </div>
  );
}
