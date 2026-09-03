/**
 * Design System Loft tokens (Design Harmony / Copan-like, public stack).
 * Source of truth for Phase 1 visual alignment — do not hardcode colors outside these tokens.
 * @see https://github.com/loft-br/loft-design-harmony
 */

export const colors = {
  primary: "#FF774A",
  primaryHover: "#E5613A",
  premium: "#BD7B00",
  background: {
    page: "#FFFFFF",
    secondary: "#F2F4F8",
    tertiary: "#DDE1E6",
  },
  text: {
    primary: "#191F23",
    secondary: "#4D5358",
    inverse: "#FFFFFF",
  },
  border: {
    default: "#DDE1E6",
  },
  feedback: {
    success: "#2ECC71",
    warning: "#F1C40F",
    error: "#E74C3C",
    info: "#3498DB",
  },
} as const;

export const typography = {
  fontFamily: "Inter, Arial, sans-serif",
  baseFontSize: 14,
  headings: { h1: 32, h2: 24, h3: 20, h4: 16 },
  body: { default: 14, small: 12 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  default: 8,
  small: 4,
} as const;

export const zIndex = {
  dropdown: 1000,
  modal: 1100,
  tooltip: 1200,
} as const;
