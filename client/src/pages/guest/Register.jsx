import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";

function Register() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  return (
    <Card title="Guest Register">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="space-y-3">
        <input
          value={form.fullName}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, fullName: event.target.value }))
          }
          className="w-full rounded border border-slate-300 px-3 py-2"
          placeholder="Full name"
        />
        <input
          value={form.email}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, email: event.target.value }))
          }
          className="w-full rounded border border-slate-300 px-3 py-2"
          placeholder="Email"
        />
        <input
          type="password"
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
          className="w-full rounded border border-slate-300 px-3 py-2"
          placeholder="Password"
        />
        <Button>Create account</Button>
      </div>
    </Card>
  );
}

export default Register;
