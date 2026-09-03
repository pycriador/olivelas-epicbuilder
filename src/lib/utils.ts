import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseHexColor(input: string): [number, number, number] | null {
  const raw = input.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(raw)) {
    return [
      Number.parseInt(raw[0]! + raw[0]!, 16),
      Number.parseInt(raw[1]! + raw[1]!, 16),
      Number.parseInt(raw[2]! + raw[2]!, 16),
    ];
  }
  if (/^[0-9a-f]{6}$/i.test(raw)) {
    return [
      Number.parseInt(raw.slice(0, 2), 16),
      Number.parseInt(raw.slice(2, 4), 16),
      Number.parseInt(raw.slice(4, 6), 16),
    ];
  }
  return null;
}

/** WCAG relative luminance for a hex color (0 = black, 1 = white). */
export function relativeLuminance(hex: string): number {
  const rgb = parseHexColor(hex);
  if (!rgb) return 0.2;
  const channels = rgb.map((value) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

export function isLightBackground(hex: string): boolean {
  return relativeLuminance(hex) > 0.55;
}

/** Readable text/chip colors for colored banners and case cards. */
export function contrastOnBackground(hex: string) {
  const light = isLightBackground(hex || "#115644");
  return {
    isLight: light,
    text: light ? "#25302c" : "#ffffff",
    muted: light ? "rgba(37, 48, 44, 0.78)" : "rgba(255, 255, 255, 0.88)",
    faint: light ? "rgba(37, 48, 44, 0.58)" : "rgba(255, 255, 255, 0.72)",
    chipBg: light ? "rgba(37, 48, 44, 0.08)" : "rgba(255, 255, 255, 0.16)",
    chipBorder: light ? "rgba(37, 48, 44, 0.22)" : "rgba(255, 255, 255, 0.28)",
    glow: light ? "rgba(37, 48, 44, 0.12)" : "rgba(255, 255, 255, 0.45)",
  };
}
