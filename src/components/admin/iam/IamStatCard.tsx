import { Link } from "@tanstack/react-router";
import { Skeleton } from "antd";

type IamStatCardProps = {
  label: string;
  value?: number | string | null;
  to?: string;
  loading?: boolean;
};

/** KPI tile for the IAM dashboard. */
export function IamStatCard({ label, value, to, loading }: IamStatCardProps) {
  const body = (
    <div
      className={
        to
          ? "group flex h-full flex-col rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_2px_rgb(25_31_35/0.04),0_8px_24px_-12px_rgb(25_31_35/0.12)] transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_4px_16px_-8px_rgb(255_119_74/0.35)]"
          : "flex h-full flex-col rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_2px_rgb(25_31_35/0.04),0_8px_24px_-12px_rgb(25_31_35/0.12)]"
      }
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton.Input active size="small" className="!mt-3 !h-8 !w-16" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {value ?? "—"}
        </p>
      )}
    </div>
  );

  if (to) {
    return (
      <Link
        to={to as never}
        className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 rounded-xl"
      >
        {body}
      </Link>
    );
  }

  return body;
}
