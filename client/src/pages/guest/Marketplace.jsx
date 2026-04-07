import { useState } from "react";
import Card from "../../components/Card";
import { services } from "../../data/services";

function Marketplace() {
  const [items] = useState(services);

  return (
    <Card title="Marketplace">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <ul className="space-y-2">
        {items.map((service) => (
          <li key={service.id} className="rounded border border-slate-200 p-3">
            <p className="font-semibold text-brand-primary">{service.name}</p>
            <p className="text-sm text-slate-500">{service.category}</p>
            <p className="text-sm">${service.price}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default Marketplace;
