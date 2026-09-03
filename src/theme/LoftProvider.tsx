import { App as AntApp, ConfigProvider } from "antd";
import ptBR from "antd/locale/pt_BR";
import type { ReactNode } from "react";

import { loftTheme } from "@/theme/loftTheme";

/** Provides Ant Design theme + pt-BR locale for Design Harmony primitives. */
export function LoftProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={loftTheme} locale={ptBR}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
