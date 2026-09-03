import {
  ArrowRightOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Badge, Card, Typography } from "antd";
import { Link } from "@tanstack/react-router";

import type { CaseItem, Impacto, Status } from "@/data/types";
import { integracaoLogoPorNome, logoDaIntegracao } from "@/data/logos";
import { ResponsavelAvatar } from "@/components/portal/ResponsavelAvatar";
import { responsavelDoCase } from "@/lib/responsaveis";

const { Text, Title } = Typography;

function integracoesDoCard(item: CaseItem): string[] {
  return (item.ferramentas ?? []).slice(0, 3);
}

const statusColor: Record<Status, string> = {
  "Em produção": "success",
  Piloto: "orange",
  "Em desenvolvimento": "default",
  Experimento: "gold",
};

export function StatusBadge({ status }: { status: Status }) {
  return <Badge color={statusColor[status]} text={status} />;
}

export function ImpactoBadge({ impacto }: { impacto: Impacto }) {
  const color = impacto === "Alto" ? "#FF774A" : impacto === "Médio" ? "#BD7B00" : "#DDE1E6";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      Impacto {impacto.toLowerCase()}
    </span>
  );
}

export function CaseThumb({ item, alto }: { item: CaseItem; alto?: boolean }) {
  const responsavel = responsavelDoCase(item);
  return (
    <div
      className={`relative overflow-hidden ${alto ? "h-[120px]" : "h-24"}`}
      style={{ backgroundColor: item.cor }}
      aria-hidden
    >
      <div className="absolute inset-0 flex items-start justify-start p-3">
        <span className="rounded bg-white/95 px-2 py-0.5 text-[11px] font-medium text-ink">
          {item.area}
        </span>
      </div>
      {responsavel ? (
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2">
          <ResponsavelAvatar
            nome={responsavel.nome}
            avatarUrl={responsavel.avatarUrl}
            className="h-9 w-9 border border-white/80 bg-white/90 text-xs"
          />
          <span className="min-w-0 truncate text-xs font-medium text-white">{responsavel.nome}</span>
        </div>
      ) : null}
    </div>
  );
}

export function CaseCard({
  item,
  de,
  onDelete,
  onEdit,
}: {
  item: CaseItem;
  de?: string;
  onDelete?: (id: string) => void;
  onEdit?: (item: CaseItem) => void;
}) {
  return (
    <Card
      size="small"
      styles={{ body: { padding: 0 } }}
      className="group relative h-full overflow-hidden border-border shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
      hoverable
    >
      <Link
        to="/cases/$id"
        params={{ id: item.id }}
        search={{ de: de ?? "cases" }}
        aria-label={`Abrir case ${item.nome}`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      {(onEdit || onDelete) && (
        <div className="absolute right-2 top-2 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {onEdit ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(item);
              }}
              className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
              aria-label={`Editar ${item.nome}`}
            >
              <EditOutlined />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:text-destructive"
              aria-label={`Excluir ${item.nome}`}
            >
              <DeleteOutlined />
            </button>
          ) : null}
        </div>
      )}
      <CaseThumb item={item} />
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-2">
          <StatusBadge status={item.status} />
        </div>
        <Title level={5} style={{ margin: 0 }}>
          {item.nome}
        </Title>
        <Text type="secondary" className="mt-2 line-clamp-3 text-sm">
          {item.descricao}
        </Text>
        <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Integrações
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {integracoesDoCard(item).map((f) => {
            const logo = logoDaIntegracao(f) ?? integracaoLogoPorNome(f);
            return (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-[11px]"
              >
                {logo ? (
                  <img src={logo} alt="" aria-hidden className="h-3.5 w-3.5 object-contain" />
                ) : null}
                {f}
              </span>
            );
          })}
        </div>
        <div className="mt-4 flex-1" />
        <span className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 text-sm font-medium">
          Ver case
          <ArrowRightOutlined />
        </span>
      </div>
    </Card>
  );
}

export function MetricCard({
  valor,
  label,
  detalhe,
  icone,
}: {
  valor: string;
  label: string;
  detalhe?: string;
  icone?: "clock" | "spark" | "users";
}) {
  const Icon =
    icone === "clock" ? ClockCircleOutlined : icone === "users" ? TeamOutlined : ThunderboltOutlined;
  return (
    <Card size="small">
      <Icon className="mb-3 text-primary" />
      <Title level={3} style={{ margin: 0 }}>
        {valor}
      </Title>
      <Text type="secondary">{label}</Text>
      {detalhe?.trim() ? (
        <Text className="mt-3 block border-t border-border pt-3 text-sm">{detalhe}</Text>
      ) : null}
    </Card>
  );
}
