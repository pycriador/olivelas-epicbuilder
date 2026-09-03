import type { ReactNode } from "react";

import { OldAppSidebar } from "@/components/layout/old/OldAppSidebar";
import { PortalApiStatusBanner } from "@/components/layout/PortalApiStatusBanner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

/** Lovable-era application chrome for classic layout mode. */
export function OldAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="lovable-classic">
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <OldAppSidebar />
          <div className="relative flex min-w-0 flex-1 flex-col">
            <SidebarTrigger className="absolute left-3 top-3 z-30 rounded-lg border border-white/25 bg-white/15 text-primary-foreground backdrop-blur-sm hover:bg-white/25 hover:text-primary-foreground" />
            <PortalApiStatusBanner />
            <main className="relative min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
