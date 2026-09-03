import { Segmented } from "antd";

import { useLayoutMode } from "@/layout/LayoutModeProvider";
import type { LayoutMode } from "@/lib/layout-mode";

/** Toggle between classic Lovable chrome and Design Harmony shell. */
export function LayoutModeSwitcher() {
  const { mode, setMode, ready } = useLayoutMode();

  if (!ready) return null;

  return (
    <Segmented<LayoutMode>
      value={mode}
      onChange={(value) => setMode(value)}
      options={[
        { label: "Clássico (Lovable)", value: "classic" },
        { label: "Novo (Design Harmony)", value: "harmony" },
      ]}
    />
  );
}
