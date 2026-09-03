import { createFileRoute } from "@tanstack/react-router";

import { apiBaseUrl } from "@/lib/jira-import";

/** Proxies Jira attachment requests to the FastAPI backend. */
export const Route = createFileRoute("/api/jira-attachment")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const search = new URL(request.url).search;
        const upstream = await fetch(`${apiBaseUrl()}/api/jira-attachment${search}`);
        if (!upstream.ok || !upstream.body) {
          return new Response("Anexo indisponível", { status: upstream.status || 502 });
        }
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "content-type":
              upstream.headers.get("content-type") ?? "application/octet-stream",
            "cache-control": upstream.headers.get("cache-control") ?? "private, max-age=300",
          },
        });
      },
    },
  },
});
