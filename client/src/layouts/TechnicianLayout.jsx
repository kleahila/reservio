import PortalLayout from "./PortalLayout";

const LINKS = [
  { to: "/technician/tasks", label: "My Tasks" },
  { to: "/guest/profile",    label: "Profile" },
];

export default function TechnicianLayout() {
  return (
    <PortalLayout
      portalName="Technician"
      links={LINKS}
      headerTitle="technician.reservio.com"
      showClockInOut
    />
  );
}
