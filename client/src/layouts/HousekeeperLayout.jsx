import PortalLayout from "./PortalLayout";

const LINKS = [
  { to: "/housekeeper/tasks", label: "My Tasks" },
];

export default function HousekeeperLayout() {
  return (
    <PortalLayout
      portalName="Housekeeping"
      links={LINKS}
      headerTitle="housekeeping.reservio.com"
      showClockInOut
    />
  );
}
