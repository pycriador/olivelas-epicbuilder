import { createFileRoute } from "@tanstack/react-router";

/**
 * Liveness probe for Kubernetes / Docker HEALTHCHECK.
 * Keep this path public and free of auth or AppShell.
 */
export const Route = createFileRoute("/health")({
  server: {
    handlers: {
      GET: async () =>
        new Response("ok\n", {
          status: 200,
          headers: { "content-type": "text/plain; charset=utf-8" },
        }),
    },
  },
});
