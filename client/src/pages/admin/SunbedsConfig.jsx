import { useState, useEffect } from 'react';
import { apiCall } from '../../api/client';

const inputCls = 'w-full rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2.5 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-sea-400/40';

export default function SunbedsConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ poolOpen: true, zones: [] });

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  useEffect(() => {
    apiCall('GET', '/api/sunbeds/config', undefined, true)
      .then((data) => {
        setConfig(data);
        setForm({ poolOpen: data?.poolOpen ?? true, zones: data?.zones ?? [] });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiCall('POST', '/api/sunbeds/config', form, true);
      setConfig(updated);
      showToast('Sunbed configuration saved.');
    } catch (err) {
      showToast('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function addZone() {
    setForm((f) => ({ ...f, zones: [...f.zones, { name: '', capacity: 10 }] }));
  }

  function removeZone(i) {
    setForm((f) => ({ ...f, zones: f.zones.filter((_, idx) => idx !== i) }));
  }

  function updateZone(i, field, value) {
    setForm((f) => ({
      ...f,
      zones: f.zones.map((z, idx) => idx === i ? { ...z, [field]: value } : z),
    }));
  }

  if (loading) return <div className="py-16 text-center text-rv-muted">Loading…</div>;

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-rv-olive-900 dark:text-rv-olive-100">Sunbed & Pool Config</h1>
        <p className="mt-1 text-sm text-rv-muted">Manage pool availability and sunbed zone layout.</p>
      </div>

      {toast && (
        <div className="rounded-xl border border-rv-sea-200/60 bg-rv-sea-50 dark:bg-rv-sea-900/20 px-5 py-3 text-sm text-rv-sea-700 dark:text-rv-sea-300">{toast}</div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-xl">
        {/* Pool toggle */}
        <div className="rounded-xl border border-rv-border bg-rv-surface p-6">
          <h2 className="mb-4 font-semibold text-rv-text">Pool Status</h2>
          <label className="flex cursor-pointer items-center gap-4">
            <div
              onClick={() => setForm((f) => ({ ...f, poolOpen: !f.poolOpen }))}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.poolOpen ? 'bg-rv-sea-500' : 'bg-rv-border2'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.poolOpen ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-rv-text">
              Pool is <strong>{form.poolOpen ? 'open' : 'closed'}</strong>
            </span>
          </label>
        </div>

        {/* Zones */}
        <div className="rounded-xl border border-rv-border bg-rv-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-rv-text">Sunbed Zones</h2>
            <button type="button" onClick={addZone} className="rounded-lg border border-rv-sea-400/40 bg-rv-sea-50 px-3 py-1.5 text-xs font-semibold text-rv-sea-700 hover:bg-rv-sea-100 dark:bg-rv-sea-900/20 dark:text-rv-sea-300">
              + Add Zone
            </button>
          </div>
          {form.zones.length === 0 && (
            <p className="text-sm text-rv-muted">No zones configured. Add one above.</p>
          )}
          <div className="space-y-3">
            {form.zones.map((z, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  value={z.name}
                  onChange={(e) => updateZone(i, 'name', e.target.value)}
                  placeholder="Zone name (e.g. Pool A)"
                  className={inputCls + ' flex-1'}
                />
                <input
                  type="number"
                  min={1}
                  value={z.capacity}
                  onChange={(e) => updateZone(i, 'capacity', Number(e.target.value))}
                  placeholder="Capacity"
                  className={inputCls + ' w-24'}
                />
                <button
                  type="button"
                  onClick={() => removeZone(i)}
                  className="rounded-lg border border-rv-danger/30 bg-rv-danger-soft px-2 py-1.5 text-xs text-rv-danger hover:bg-rv-danger/20"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-rv-sea-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rv-sea-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
