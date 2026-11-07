import loftLogo from "@/assets/loft-logo.png";
import { cn, parseHexColor } from "@/lib/utils";

/** Official orange banner colors where the orange wordmark would disappear. */
const ORANGE_BANNER_HEX = new Set(["#ff774a", "#d94616"]);

/**
 * Keep the brand-orange wordmark on green/gray/ink banners.
 * Invert to white only on orange/warm backgrounds (contrast).
 */
export function shouldUseWhiteLoftMark(backgroundColor: string): boolean {
  const hex = (backgroundColor || "").trim().toLowerCase();
  if (ORANGE_BANNER_HEX.has(hex)) return true;
  const rgb = parseHexColor(hex);
  if (!rgb) return false;
  const [r, g, b] = rgb;
  // Warm orange / terracotta family
  return r > 180 && g > 50 && g < 190 && b < 130 && r > g + 20 && r > b + 40;
}

/**
 * Loft wordmark on colored banners.
 * Asset is brand orange — stays orange on Verde Loft / verde claro / cinza / ink;
 * turns white only on laranja banners.
 */
export function LoftMark({
  backgroundColor,
  className,
  alt = "Olivelas",
}: {
  backgroundColor: string;
  className?: string;
  alt?: string;
}) {
  const white = shouldUseWhiteLoftMark(backgroundColor || "#115644");

  return (
    <img
      src={loftLogo}
      alt={alt}
      className={cn("w-auto object-contain", white && "brightness-0 invert", className)}
      loading="eager"
    />
  );
}
