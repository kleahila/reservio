import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";

function OnboardHotel() {
  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    plan: "Starter",
  });

  return (
    <Card title="Onboard Hotel">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="grid gap-3 md:grid-cols-3">
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Hotel Name"
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
        />
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Subdomain"
          value={form.subdomain}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, subdomain: event.target.value }))
          }
        />
        <select
          className="rounded border border-slate-300 px-3 py-2"
          value={form.plan}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, plan: event.target.value }))
          }
        >
          <option>Starter</option>
          <option>Standard</option>
          <option>Premium</option>
        </select>
      </div>
      <div className="mt-4">
        <Button>Onboard Tenant</Button>
      </div>
    </Card>
  );
}

export default OnboardHotel;
