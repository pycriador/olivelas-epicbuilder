import { Breadcrumb } from "antd";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type IamAdminShellProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

/** IAM admin page layout — breadcrumb + content (navigation lives in AppShell sidebar). */
export function IamAdminShell({ title, description, actions, children }: IamAdminShellProps) {
  return (
    <div className="min-h-full bg-[color-mix(in_oklab,var(--muted)_55%,var(--background))]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <Breadcrumb
          className="mb-5 [&_.ant-breadcrumb-link]:text-muted-foreground [&_.ant-breadcrumb-separator]:text-muted-foreground/50 [&_a]:text-muted-foreground [&_a:hover]:text-primary [&_span]:text-foreground"
          items={[
            { title: <Link to="/portal">Início</Link> },
            { title: <Link to="/admin/iam">IAM</Link> },
            { title },
          ]}
        />

        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground md:text-[1.75rem]">
              {title}
            </h1>
            {description ? (
              <p className="mt-1.5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </header>

        <div className="flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}
