import { useState } from "react";
import Card from "../../components/Card";

const initialPlans = [
  { id: 1, name: "Starter", monthlyPrice: 49, maxRooms: 25 },
  { id: 2, name: "Standard", monthlyPrice: 99, maxRooms: 80 },
  { id: 3, name: "Premium", monthlyPrice: 199, maxRooms: 250 },
];

function SubscriptionPlans() {
  const [plans] = useState(initialPlans);

  return (
    <Card title="Subscription Plans">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2">Plan</th>
              <th className="py-2">Monthly Price</th>
              <th className="py-2">Max Rooms</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b border-slate-100">
                <td className="py-2">{plan.name}</td>
                <td className="py-2">${plan.monthlyPrice}</td>
                <td className="py-2">{plan.maxRooms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default SubscriptionPlans;
