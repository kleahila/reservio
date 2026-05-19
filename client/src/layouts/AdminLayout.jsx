import PortalLayout from "./PortalLayout";

const LINKS = [
  { to: "/admin/command-center", label: "Command Center" },
  { to: "/admin/rooms",          label: "Rooms"          },
  { to: "/admin/staff",          label: "Staff"          },
  { to: "/admin/pricing",        label: "Pricing"        },
  { to: "/admin/analytics",      label: "Analytics"      },
  { to: "/admin/parking",        label: "Parking"        },
  { to: "/admin/staff-hours",    label: "Staff Hours"    },
  { to: "/admin/maintenance",    label: "Maintenance"    },
  { to: "/admin/guests",         label: "Guests"         },
  { to: "/admin/calendar",       label: "Calendar"       },
  { to: "/admin/activity",       label: "Activity Log"   },
  { to: "/admin/sunbeds",        label: "Pool & Sunbeds" },
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
