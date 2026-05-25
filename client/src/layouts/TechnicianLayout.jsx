import PortalLayout from "./PortalLayout";

const LINKS = [
  { to: "/technician/tasks", label: "My Tasks" },
  { to: "/technician/profile", label: "Profile" },
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
