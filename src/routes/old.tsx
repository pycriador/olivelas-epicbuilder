import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Spin } from "antd";
import { useEffect } from "react";

import { useLayoutMode } from "@/layout/LayoutModeProvider";

/**
 * Legacy preview URL — enables classic layout and redirects to `/portal`.
 */
export const Route = createFileRoute("/old")({
  head: () => ({
    meta: [{ title: "AIOps App Model — Loft | Layout clássico" }],
  }),
  component: OldRedirect,
});

function OldRedirect() {
  const navigate = useNavigate();
  const { setMode } = useLayoutMode();

  useEffect(() => {
    setMode("classic");
    void navigate({ to: "/portal", replace: true });
  }, [navigate, setMode]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spin size="large" description="Abrindo layout clássico…" />
    </div>
  );
}
