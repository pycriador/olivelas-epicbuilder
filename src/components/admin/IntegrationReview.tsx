import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";

import type { IntegrationDetection } from "@/components/admin/CaseLivePreview";
import { integracaoLogoPorNome } from "@/data/logos";

export function IntegrationReview({
  detections,
  onConfirm,
  onReject,
}: {
  detections: IntegrationDetection[];
  onConfirm: (nome: string) => void;
  onReject: (nome: string) => void;
}) {
  const pending = detections.filter((d) => (d.status ?? "pending") === "pending");
  const confirmed = detections.filter((d) => d.status === "confirmed");
  if (!pending.length && !confirmed.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted-foreground">
        A IA encontrou menções no Jira. Confirme se cada uma é uma integração real do produto
        antes de publicar.
      </p>
      {pending.map((item) => (
        <DetectionCard
          key={item.nome}
          item={item}
          actions={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onConfirm(item.nome);
                }}
              >
                <CheckOutlined className="text-xs" />
                Confirmar integração
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onReject(item.nome);
                }}
              >
                <CloseOutlined className="text-xs" />
                Não é integração
              </button>
            </div>
          }
        />
      ))}
      {confirmed.map((item) => (
        <DetectionCard key={`ok-${item.nome}`} item={item} badge="Confirmada" />
      ))}
    </div>
  );
}

function DetectionCard({
  item,
  actions,
  badge,
}: {
  item: IntegrationDetection;
  actions?: ReactNode;
  badge?: string;
}) {
  const logo = integracaoLogoPorNome(item.nome);
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-white p-1.5">
          {logo ? (
            <img src={logo} alt="" className="h-6 w-6 object-contain" />
          ) : (
            <span className="text-xs font-semibold">{item.nome.slice(0, 2)}</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{item.nome}</p>
            {badge ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {badge}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/85">{item.motivo}</p>
          <ul className="mt-3 space-y-2">
            {item.citations.map((c, index) => (
              <li
                key={`${c.issueKey}-${index}`}
                className="rounded-xl bg-secondary/50 px-3 py-2 text-xs leading-relaxed"
              >
                <p className="font-medium text-foreground">
                  {c.issueKey} · {c.issueType} · {c.field}
                </p>
                <p className="mt-0.5 text-muted-foreground">{c.issueSummary}</p>
                <p className="mt-1.5 border-l-2 border-primary/40 pl-2 text-foreground/80">
                  “{c.quote}”
                </p>
              </li>
            ))}
          </ul>
          {actions ? <div className="mt-3">{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}
