import PortalLayout from "./PortalLayout";

const LINKS = [
  { to: "/staff/dashboard",    label: "Dashboard" },
  { to: "/staff/reservations", label: "Reservations" },
  { to: "/staff/rooms",        label: "Room Status" },
  { to: "/staff/housekeeping", label: "Housekeeping" },
];

export default function StaffLayout() {
  return (
    <PortalLayout
      portalName="Staff"
      links={LINKS}
      headerTitle="staff.reservio.com"
    />
  );
}
