import { contrastOnBackground } from "@/lib/utils";

/** Colored hero banner used on Academy trilha/aula pages and similar surfaces. */
export function ColorHeroBanner({
  backgroundColor,
  eyebrow,
  title,
  description,
  className,
  children,
}: {
  backgroundColor: string;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const tone = contrastOnBackground(backgroundColor || "#115644");

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border p-6 sm:p-8 ${className ?? ""}`}
      style={{ backgroundColor: backgroundColor || "#115644", color: tone.text }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 18% 20%, ${tone.glow} 0, transparent 45%), radial-gradient(circle at 88% 75%, ${tone.glow} 0, transparent 40%)`,
        }}
        aria-hidden
      />
      <div className="relative">
        <p
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: tone.faint }}
        >
          {eyebrow}
        </p>
        <h1 className="mt-3 text-balance text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description ? (
          <p
            className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed sm:text-base"
            style={{ color: tone.muted }}
          >
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
