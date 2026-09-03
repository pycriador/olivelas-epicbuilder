import { Modal } from "antd";
import { useState } from "react";

import { avatarEmAltaQualidade, iniciaisDe } from "@/lib/responsaveis";
import { resolveApiAssetUrl } from "@/lib/jira-import";
import { cn } from "@/lib/utils";

/** Foto do responsável (vinda do Jira) com fallback para iniciais. */
export function ResponsavelAvatar({
  nome,
  avatarUrl,
  className,
  textClassName,
}: {
  nome: string;
  avatarUrl?: string | undefined;
  className?: string;
  textClassName?: string;
}) {
  const [falhou, setFalhou] = useState(false);
  const [aberto, setAberto] = useState(false);
  const fotoUrl = avatarUrl ? resolveApiAssetUrl(avatarUrl) : undefined;
  const mostrarFoto = Boolean(fotoUrl) && !falhou;

  const conteudo = (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border border-border/70 bg-secondary text-[11px] font-semibold text-foreground/75",
        "h-8 w-8",
        className,
      )}
    >
      {mostrarFoto ? (
        <img
          src={fotoUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFalhou(true)}
        />
      ) : (
        <span className={textClassName}>{iniciaisDe(nome)}</span>
      )}
    </span>
  );

  if (!mostrarFoto) return <span aria-hidden>{conteudo}</span>;

  return (
    <>
      <button
        type="button"
        aria-label={`Ver foto de ${nome}`}
        className="relative z-20 shrink-0 rounded-full transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setAberto(true);
        }}
      >
        {conteudo}
      </button>

      <Modal
        open={aberto}
        onCancel={() => setAberto(false)}
        footer={null}
        title={null}
        centered
        destroyOnHidden
        width={448}
        styles={{ body: { padding: 0 }, container: { padding: 0, overflow: "hidden" } }}
      >
        <span className="sr-only">{nome}</span>
        <div className="bg-secondary/40 p-6">
          <img
            src={avatarEmAltaQualidade(avatarUrl)}
            alt={nome}
            className="mx-auto aspect-square w-full max-w-[22rem] rounded-2xl object-cover shadow-lg"
          />
          <p className="mt-4 text-center text-base font-semibold">{nome}</p>
        </div>
      </Modal>
    </>
  );
}

export function ResponsavelChip({
  nome,
  avatarUrl,
  className,
}: {
  nome: string;
  avatarUrl?: string | undefined;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <ResponsavelAvatar nome={nome} avatarUrl={avatarUrl} className="h-7 w-7" />
      <span className="min-w-0 truncate text-xs font-medium">{nome}</span>
    </span>
  );
}
