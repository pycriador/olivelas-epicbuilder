import { createFileRoute } from "@tanstack/react-router";

import { apiBaseUrl } from "@/lib/jira-import";

/** Proxies Jira avatar requests to the FastAPI backend. */
export const Route = createFileRoute("/api/jira-avatar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const search = new URL(request.url).search;
        const upstream = await fetch(`${apiBaseUrl()}/api/jira-avatar${search}`);
        if (!upstream.ok || !upstream.body) {
          return new Response("Avatar indisponível", { status: upstream.status || 502 });
        }
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "content-type": upstream.headers.get("content-type") ?? "image/png",
            "cache-control": upstream.headers.get("cache-control") ?? "private, max-age=86400",
          },
        });
      },
    },
  },
});
