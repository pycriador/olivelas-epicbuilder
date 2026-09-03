import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/biblioteca")({
  beforeLoad: () => {
    throw redirect({ to: "/portal" });
  },
});
