import {
  CheckOutlined,
  CopyOutlined,
  DeleteOutlined,
  ExpandOutlined,
  LeftOutlined,
  MinusOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Button, Input, Modal } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { Print } from "@/data/galeria";
import { isVideoMedia } from "@/data/galeria";
import { resolveApiAssetUrl } from "@/lib/jira-import";

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function GaleriaLightbox({
  print: p,
  alt,
  onClose,
  onPrev,
  onNext,
  editable = false,
  onTitleChange,
  onDelete,
  subtitle,
}: {
  print: Print | null;
  alt: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  editable?: boolean;
  onTitleChange?: (titulo: string) => void;
  onDelete?: () => void;
  /** Extra line under the title (e.g. Jira origin in preview only). */
  subtitle?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [copiado, setCopiado] = useState(false);
  const stateRef = useRef({ zoom, offset });
  stateRef.current = { zoom, offset };
  const mediaUrl = p ? resolveApiAssetUrl(p.url) : "";
  const isVideo = Boolean(p && isVideoMedia(mediaUrl || p.url, p.mimeType));

  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    reset();
    setCopiado(false);
  }, [p?.id, reset]);

  const navRef = useRef({ onPrev, onNext });
  navRef.current = { onPrev, onNext };

  useEffect(() => {
    if (!p) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navRef.current.onPrev?.();
      if (e.key === "ArrowRight") navRef.current.onNext?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [p]);

  const zoomAt = useCallback((factorTarget: number, px: number, py: number) => {
    const { zoom: z, offset: o } = stateRef.current;
    const next = clamp(factorTarget, MIN_ZOOM, MAX_ZOOM);
    if (next === z) return;
    const k = next / z;
    if (next === MIN_ZOOM) {
      setZoom(next);
      setOffset({ x: 0, y: 0 });
      return;
    }
    setZoom(next);
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
  }, []);

  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    if (isVideo) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(
      stateRef.current.zoom * Math.exp(-dy * 0.0018),
      e.clientX - rect.left,
      e.clientY - rect.top,
    );
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || isVideo) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [p?.id, isVideo]);

  const botao = (delta: number) => {
    const el = containerRef.current;
    const rect = el?.getBoundingClientRect();
    zoomAt(stateRef.current.zoom * delta, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2);
  };

  const arrastando = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  async function copiar() {
    if (!p || !mediaUrl) return;
    if (isVideo) {
      try {
        await navigator.clipboard.writeText(
          mediaUrl.startsWith("http") || mediaUrl.startsWith("blob:")
            ? mediaUrl
            : window.location.href,
        );
        setCopiado(true);
        toast.success("Link do vídeo copiado");
        setTimeout(() => setCopiado(false), 2000);
      } catch {
        toast.error("Não foi possível copiar o link do vídeo");
      }
      return;
    }
    try {
      const res = await fetch(mediaUrl);
      const blob = await res.blob();
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
      const png: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      setCopiado(true);
      toast.success("Imagem copiada");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(
          mediaUrl.startsWith("http") ? mediaUrl : `${window.location.origin}${mediaUrl}`,
        );
        toast.success("Link da imagem copiado");
      } catch {
        toast.error("Não foi possível copiar a imagem");
      }
    }
  }

  return (
    <Modal
      open={!!p}
      onCancel={onClose}
      footer={null}
      title={null}
      width="min(1400px, 95vw)"
      centered
      destroyOnHidden
      styles={{ body: { padding: 0 }, container: { padding: 0, overflow: "hidden" } }}
    >
      {p && (
        <>
          <span className="sr-only">{p.titulo}</span>
          <div
            ref={containerRef}
            className="relative select-none overflow-hidden bg-ink/90"
            style={{
              height: "min(72vh, 820px)",
              cursor: !isVideo && zoom > 1 ? "grab" : "default",
            }}
            onPointerDown={(e) => {
              if (isVideo || zoom <= 1) return;
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              arrastando.current = {
                x: e.clientX,
                y: e.clientY,
                ox: offset.x,
                oy: offset.y,
              };
            }}
            onPointerMove={(e) => {
              const d = arrastando.current;
              if (!d) return;
              setOffset({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) });
            }}
            onPointerUp={() => {
              arrastando.current = null;
            }}
            onDoubleClick={(e) => {
              if (isVideo) return;
              const rect = containerRef.current?.getBoundingClientRect();
              if (!rect) return;
              zoomAt(zoom > 1 ? 1 : 2.5, e.clientX - rect.left, e.clientY - rect.top);
            }}
          >
            {isVideo ? (
              <video
                key={p.id}
                src={mediaUrl}
                controls
                playsInline
                className="h-full w-full object-contain"
                aria-label={alt}
              />
            ) : (
              <img
                src={mediaUrl}
                alt={alt}
                draggable={false}
                className="h-full w-full object-contain"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: "0 0",
                  transition: arrastando.current ? "none" : "transform 120ms ease-out",
                  imageRendering: zoom > 2 ? "auto" : undefined,
                }}
              />
            )}

            {onPrev && (
              <button
                type="button"
                onClick={onPrev}
                aria-label="Item anterior"
                className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-ink/60 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-ink/80"
              >
                <LeftOutlined className="text-lg" />
              </button>
            )}
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                aria-label="Próximo item"
                className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-ink/60 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-ink/80"
              >
                <RightOutlined className="text-lg" />
              </button>
            )}

            {!isVideo ? (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-ink/70 p-1 backdrop-blur-md">
                <Button
                  type="text"
                  shape="circle"
                  className="!text-white hover:!bg-white/15 hover:!text-white"
                  onClick={() => botao(1 / 1.4)}
                  aria-label="Diminuir zoom"
                  icon={<MinusOutlined />}
                />
                <span className="min-w-12 text-center font-mono text-xs text-white/80">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  type="text"
                  shape="circle"
                  className="!text-white hover:!bg-white/15 hover:!text-white"
                  onClick={() => botao(1.4)}
                  aria-label="Aumentar zoom"
                  icon={<PlusOutlined />}
                />
                <span className="mx-1 h-5 w-px bg-white/15" />
                <Button
                  type="text"
                  shape="circle"
                  className="!text-white hover:!bg-white/15 hover:!text-white"
                  onClick={reset}
                  aria-label="Ajustar à tela"
                  icon={<ExpandOutlined />}
                />
                <Button
                  type="text"
                  shape="circle"
                  className="!text-white hover:!bg-white/15 hover:!text-white"
                  onClick={copiar}
                  aria-label="Copiar imagem"
                  icon={copiado ? <CheckOutlined /> : <CopyOutlined />}
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-3 p-6">
            {editable && onTitleChange ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1 space-y-2">
                  <Input
                    value={p.titulo}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder={isVideo ? "Nome do vídeo" : "Nome da imagem"}
                    size="large"
                    className="w-full rounded-xl text-base font-semibold"
                    aria-label={isVideo ? "Nome do vídeo" : "Nome da imagem"}
                  />
                  {subtitle ? (
                    <p className="text-sm leading-relaxed text-muted-foreground break-words">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
                {onDelete ? (
                  <Button
                    type="default"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={onDelete}
                  >
                    Excluir
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold break-words">{p.titulo}</h3>
                {subtitle ? (
                  <p className="text-sm leading-relaxed text-muted-foreground break-words">
                    {subtitle}
                  </p>
                ) : null}
              </>
            )}
            {!editable && !subtitle && p.descricao?.trim() ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{p.descricao}</p>
            ) : null}
          </div>
        </>
      )}
    </Modal>
  );
}
