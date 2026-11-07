import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";

import jiraLogo from "@/assets/logos/jira.svg";

/** Stages keyed by elapsed seconds — mirrors real import phases better than fake % caps. */
const PUBLISH_STAGES = [
  { untilSec: 2, label: "Salvando o projeto no Olivelas App Model" },
  { untilSec: 6, label: "Procurando a pasta do responsável no Confluence" },
  { untilSec: 14, label: "Criando a página de status do projeto no Confluence" },
  { untilSec: 30, label: "Enviando imagens e conteúdo para o Confluence" },
  { untilSec: Number.POSITIVE_INFINITY, label: "Finalizando…" },
];

const STAGES = [
  { untilSec: 2, label: "Conectando ao Jira" },
  { untilSec: 8, label: "Lendo o épico e a hierarquia" },
  { untilSec: 18, label: "Varrendo histórias, tasks e subtarefas" },
  { untilSec: 35, label: "Baixando prints e anexos" },
  { untilSec: 90, label: "Organizando o case com a IA" },
  { untilSec: Number.POSITIVE_INFINITY, label: "Finalizando…" },
];

function MagnifyingGlass() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 drop-shadow-[0_8px_16px_rgba(0,82,204,0.35)]" aria-hidden>
      <defs>
        <linearGradient id="jira-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#DEEBFF" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2684FF" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <circle cx="26" cy="26" r="16" fill="url(#jira-glass)" stroke="#0052CC" strokeWidth="3.5" />
      <circle cx="26" cy="26" r="10" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.5" />
      <path d="M38 38 L54 54" stroke="#0052CC" strokeWidth="5" strokeLinecap="round" />
      <path d="M40.5 40.5 L54 54" stroke="#2684FF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Asymptotic progress: keeps moving (never freezes at 92%) and approaches 97% while waiting. */
function progressFromElapsed(elapsedSec: number): number {
  // ~35% @ 5s, ~55% @ 12s, ~75% @ 25s, ~90% @ 50s, approaches 97
  const p = 97 * (1 - Math.exp(-elapsedSec / 22));
  return Math.min(97, Math.max(2, p));
}

export function JiraImportLoading({
  open,
  done,
  variant = "import",
}: {
  open: boolean;
  done: boolean;
  variant?: "import" | "publish";
}) {
  const [progress, setProgress] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setElapsedSec(0);
      return;
    }

    if (done) {
      setProgress(100);
      return;
    }

    const started = performance.now();
    setProgress(progressFromElapsed(0));
    setElapsedSec(0);

    const timer = window.setInterval(() => {
      const elapsed = (performance.now() - started) / 1000;
      setElapsedSec(elapsed);
      setProgress(progressFromElapsed(elapsed));
    }, 120);

    return () => window.clearInterval(timer);
  }, [open, done]);

  const stage = useMemo(() => {
    const stages = variant === "publish" ? PUBLISH_STAGES : STAGES;
    return stages.find((item) => elapsedSec < item.untilSec)?.label ?? "Finalizando…";
  }, [elapsedSec, variant]);

  const percent = Math.round(progress);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-center px-4">
      <div className="absolute inset-0 bg-[#0b1f3a]/55 backdrop-blur-[6px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="jira-loading-title"
        className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_28px_80px_-24px_rgba(0,82,204,0.45)]"
      >
        <div className="h-1.5 bg-gradient-to-r from-[#0052CC] via-[#2684FF] to-[#00B8D9]" />

        <div className="px-8 pb-8 pt-7 text-center">
          <p
            id="jira-loading-title"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#0052CC]"
          >
            {variant === "publish" ? "Publicando projeto" : "Importando do Jira"}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#172B4D]">
            {variant === "publish" ? "Criando página no Confluence" : "Analisando o board"}
          </h2>

          <div className="relative mx-auto mt-7 grid h-40 w-40 place-items-center">
            <span className="jira-pulse-ring absolute inset-0 rounded-full border border-[#2684FF]/30" />
            <span className="jira-pulse-ring-delay absolute inset-3 rounded-full border border-[#0052CC]/20" />
            <div className="relative grid h-[7.5rem] w-[7.5rem] place-items-center overflow-hidden rounded-full bg-[#F4F5F7] ring-1 ring-[#DFE1E6]">
              <span className="jira-scan-line absolute inset-x-3 h-8 rounded-full bg-gradient-to-b from-transparent via-[#2684FF]/25 to-transparent" />
              <img src={jiraLogo} alt="" className="relative z-[1] h-16 w-16 object-contain" />
              <span className="jira-magnifier pointer-events-none absolute z-[2]">
                <MagnifyingGlass />
              </span>
            </div>
          </div>

          <p className="mt-6 min-h-10 text-sm leading-relaxed text-[#5E6C84]">{stage}</p>

          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#97A0AF]">
                Progresso
              </span>
              <span className="font-display text-2xl font-semibold tabular-nums text-[#0052CC]">
                {percent}
                <span className="ml-0.5 text-sm font-medium text-[#2684FF]">%</span>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#EBECF0]">
              <div
                className="jira-progress-fill relative h-full rounded-full bg-gradient-to-r from-[#0052CC] via-[#2684FF] to-[#00B8D9] transition-[width] duration-150 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
