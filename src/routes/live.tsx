import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LiveShell } from "@/components/shell";

export const Route = createFileRoute("/live")({
  component: () => (
    <LiveShell>
      <Outlet />
    </LiveShell>
  ),
});
