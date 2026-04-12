import PortalLayout from "./PortalLayout";

const LINKS = [
  { to: "/admin/rooms",     label: "Rooms" },
  { to: "/admin/staff",     label: "Staff" },
  { to: "/admin/pricing",   label: "Pricing" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/parking",   label: "Parking" },
];

export default function AdminLayout() {
  return (
    <PortalLayout
      portalName="Hotel Admin"
      links={LINKS}
      headerTitle="admin.reservio.com"
    />
  );
}
