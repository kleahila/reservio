import PortalLayout from "./PortalLayout";

const LINKS = [
  { to: "/superadmin/tenants",       label: "Tenants"         },
  { to: "/superadmin/subscriptions", label: "Subscriptions"   },
  { to: "/superadmin/analytics",     label: "Analytics"       },
  { to: "/superadmin/onboard",       label: "Onboard Hotel"   },
  { to: "/superadmin/status",        label: "Platform Status" },
  { to: "/superadmin/activity",      label: "Activity Log"    },
];

export default function SuperAdminLayout() {
  return (
    <PortalLayout
      portalName="Super Admin"
      links={LINKS}
      headerTitle="superadmin.reservio.com"
    />
  );
}
