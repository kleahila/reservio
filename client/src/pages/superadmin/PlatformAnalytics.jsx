import { useState } from "react";
import Card from "../../components/Card";
import { tenants } from "../../data/tenants";

function PlatformAnalytics() {
  const [rows] = useState(tenants);

  return (
    <Card title="Platform Analytics">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2">Tenant</th>
              <th className="py-2">Plan</th>
              <th className="py-2">Status</th>
              <th className="py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-2">{row.name}</td>
                <td className="py-2">{row.plan}</td>
                <td className="py-2">{row.status}</td>
                <td className="py-2">{row.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default PlatformAnalytics;
