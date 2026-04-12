import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import { mockStaff } from "../../data/mockStaff";

const ROLES = ["Staff", "Housekeeper"];

const inputCls =
  "w-full rounded-lg border border-rv-border2 bg-rv-bg px-3 py-2.5 text-sm text-rv-text placeholder:text-rv-subtle outline-none focus:ring-2 focus:ring-rv-accent/40";

let nextId = mockStaff.length + 1;

export default function StaffManagement() {
  const [staff, setStaff] = useState(mockStaff);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Staff" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.includes("@")) e.email = "Valid email is required.";
    return e;
  }

  function handleInvite(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const newMember = { id: nextId++, name: form.name, email: form.email, role: form.role, status: "Active" };
    setStaff((s) => [...s, newMember]);
    setShowModal(false);
    setForm({ name: "", email: "", role: "Staff" });
    setToast(`Invite sent to ${newMember.email}`);
    setTimeout(() => setToast(""), 3000);
  }

  function toggleStatus(id) {
    setStaff((s) =>
      s.map((m) =>
        m.id === id ? { ...m, status: m.status === "Active" ? "Inactive" : "Active" } : m,
      ),
    );
  }

  return (
    <div>
      <PageHeader
        title="Staff Accounts"
        subtitle="Manage hotel staff members and housekeepers."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-rv-accent px-4 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90"
          >
            Add staff member
          </button>
        }
      />

      {toast && (
        <div className="mb-4 rounded-xl border border-rv-success/30 bg-rv-success-soft px-5 py-3 text-sm font-medium text-rv-success">
          {toast}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-rv-border bg-rv-surface">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="border-b border-rv-border">
            <tr className="text-xs font-semibold uppercase tracking-wider text-rv-muted">
              {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rv-border">
            {staff.map((member) => (
              <tr key={member.id} className="transition hover:bg-rv-surface2">
                <td className="px-5 py-3 font-medium text-rv-text">{member.name}</td>
                <td className="px-5 py-3 text-rv-muted">{member.email}</td>
                <td className="px-5 py-3 text-rv-muted">{member.role}</td>
                <td className="px-5 py-3"><StatusBadge status={member.status} /></td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleStatus(member.id)}
                    className="rounded-lg border border-rv-border2 px-3 py-1.5 text-xs font-medium text-rv-muted hover:text-rv-text"
                  >
                    {member.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add staff member">
        <form onSubmit={handleInvite} noValidate className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Full name</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Smith" className={inputCls} />
            {errors.name && <p className="mt-1 text-xs text-rv-danger">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@hotel.com" className={inputCls} />
            {errors.email && <p className="mt-1 text-xs text-rv-danger">{errors.email}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rv-text">Role</label>
            <select value={form.role} onChange={(e) => set("role", e.target.value)} className={inputCls}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowModal(false)}
              className="rounded-lg border border-rv-border2 px-4 py-2 text-sm font-medium text-rv-muted">
              Cancel
            </button>
            <button type="submit"
              className="rounded-lg bg-rv-accent px-4 py-2 text-sm font-semibold text-white hover:bg-rv-accent/90">
              Send invite
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
