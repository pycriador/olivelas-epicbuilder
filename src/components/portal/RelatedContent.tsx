import { ArrowRightOutlined, BookOutlined } from "@ant-design/icons";
import { Card } from "antd";
import { Link } from "@tanstack/react-router";
import type { ComponentType } from "react";

import { getCachedContent } from "@/lib/content-store";

interface Props {
  aulas?: string[];
  templates?: string[];
  ferramentas?: string[];
  cases?: string[];
}

function ItemLink({
  titulo,
  meta,
  to,
  params,
  search,
  icon: Icon,
}: {
  titulo: string;
  meta: string;
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="card-hover shadow-card" styles={{ body: { padding: 0 } }} size="small">
      <Link
        to={to}
        params={params as never}
        search={search as never}
        className="flex min-w-0 items-center gap-3 p-4"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary">
          <Icon className="text-accent" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{titulo}</span>
          <span className="block truncate text-xs text-muted-foreground">{meta}</span>
        </span>
        <ArrowRightOutlined className="shrink-0 text-muted-foreground" />
      </Link>
    </Card>
  );
}

export function RelatedContent({ cases = [] }: Props) {
  const catalog = getCachedContent().cases;
  const itens = cases
    .map((id) => catalog.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => (
      <ItemLink
        key={c!.id}
        titulo={c!.nome}
        meta={`Case · ${c!.area}`}
        to="/cases/$id"
        params={{ id: c!.id }}
        search={{ de: "cases" }}
        icon={BookOutlined}
      />
    ));

  if (!itens.length) return null;
  return <div className="grid gap-3 sm:grid-cols-2">{itens}</div>;
}
