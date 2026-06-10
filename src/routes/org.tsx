import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OrgShell } from "@/components/shell";

export const Route = createFileRoute("/org")({
  component: () => <OrgShell><Outlet /></OrgShell>,
});
