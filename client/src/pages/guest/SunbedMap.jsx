import { useState } from "react";
import Card from "../../components/Card";
import { sunbeds } from "../../data/sunbeds";

function SunbedMap() {
  const [items] = useState(sunbeds);

  return (
    <Card title="Sunbed Map">
      {/* TODO: Build full UI - see Week 7 work split doc */}
      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
        {items.map((sunbed) => (
          <div
            key={sunbed.id}
            className="rounded border border-slate-200 p-3 text-center"
          >
            <p className="font-semibold">{sunbed.label}</p>
            <p className="text-xs text-slate-500">{sunbed.zone}</p>
            <p className="text-xs">{sunbed.status}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default SunbedMap;
