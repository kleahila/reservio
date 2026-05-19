import { useState, useEffect } from 'react';
import { getGuests, blacklistGuest, unblacklistGuest } from '../../api/guests';
import Modal from '../../components/Modal';

export default function GuestList() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blacklistTarget, setBlacklistTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  useEffect(() => {
    getGuests()
      .then((data) => { setGuests(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleBlacklist(e) {
    e.preventDefault();
    if (!blacklistTarget) return;
    setSaving(true);
    try {
      await blacklistGuest(blacklistTarget.id, reason);
      setGuests((prev) => prev.map((g) => g.id === blacklistTarget.id ? { ...g, blacklisted: true } : g));
      showToast(`${blacklistTarget.fullName} blacklisted.`);
      setBlacklistTarget(null);
      setReason('');
    } catch (err) { showToast('Error: ' + err.message); }
    finally { setSaving(false); }
  }

  async function handleUnblacklist(guest) {
    try {
      await unblacklistGuest(guest.id);
      setGuests((prev) => prev.map((g) => g.id === guest.id ? { ...g, blacklisted: false } : g));
      showToast(`${guest.fullName} removed from blacklist.`);
    } catch (err) { showToast('Error: ' + err.message); }
  }

  return (
    <div className="px-6 md:px-10 lg:px-16 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-rv-olive-900 dark:text-rv-olive-100">Guest List</h1>
        <p className="mt-1 text-sm text-rv-muted">Manage guest accounts and blacklist status.</p>
      </div>

      {toast && <div className="rounded-xl border border-rv-sea-200/60 bg-rv-sea-50 dark:bg-rv-sea-900/20 px-5 py-3 text-sm text-rv-sea-700 dark:text-rv-sea-300">{toast}</div>}

      {loading && <div className="py-8 text-center text-rv-muted">Loading guests…</div>}

      {!loading && (
        <div className="overflow-x-auto rounded-xl border border-rv-border bg-rv-surface">
          <table className="min-w-full text-sm">
            <thead className="border-b border-rv-border">
              <tr className="text-xs font-semibold uppercase tracking-wide text-rv-muted">
                {['Name', 'Email', 'Username', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rv-border">
              {guests.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-rv-muted">No guests found.</td></tr>
              ) : guests.map((g) => (
                <tr key={g.id} className="hover:bg-rv-surface2 transition">
                  <td className="px-5 py-3 font-medium text-rv-text">{g.fullName}</td>
                  <td className="px-5 py-3 text-rv-muted">{g.email}</td>
                  <td className="px-5 py-3 text-rv-muted font-mono">{g.username ?? '—'}</td>
                  <td className="px-5 py-3">
                    {g.blacklisted ? (
                      <span className="rounded-full bg-rv-danger-soft px-2.5 py-0.5 text-xs font-semibold text-rv-danger">Blacklisted</span>
                    ) : (
                      <span className="rounded-full bg-rv-olive-50 dark:bg-rv-olive-900/30 px-2.5 py-0.5 text-xs font-semibold text-rv-olive-700 dark:text-rv-olive-300">Active</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {g.blacklisted ? (
                      <button onClick={() => handleUnblacklist(g)} className="rounded-lg border border-rv-border2 px-3 py-1.5 text-xs font-medium text-rv-muted hover:text-rv-text">
                        Remove Blacklist
                      </button>
                    ) : (
                      <button onClick={() => { setBlacklistTarget(g); setReason(''); }} className="rounded-lg bg-rv-danger-soft px-3 py-1.5 text-xs font-semibold text-rv-danger hover:bg-rv-danger/20">
                        Blacklist
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!blacklistTarget} onClose={() => setBlacklistTarget(null)} title={`Blacklist — ${blacklistTarget?.fullName}`}>
        <form onSubmit={handleBlacklist} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Reason (optional)</label>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for blacklisting…" className="w-full rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2.5 text-sm text-rv-text outline-none focus:ring-2 focus:ring-rv-danger/30 resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setBlacklistTarget(null)} className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-rv-danger px-4 py-2 text-sm font-semibold text-white hover:bg-rv-danger/90 disabled:opacity-50">
              {saving ? 'Saving…' : 'Confirm Blacklist'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
