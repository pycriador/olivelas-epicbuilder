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
  /** Copan-aligned tokens (see Copan Design System preview). */
  copan: {
    orange550: "#F56738",
    orange50: "#FFF2EC",
    neutral900: "#121619",
    neutral500: "#697077",
    neutral400: "#878D96",
    slate50: "#F2F4F8",
    slate100: "#E1E9EF",
    positive50: "#E8F5F0",
    positive500: "#20A483",
    info50: "#EDF6FC",
    elevationOverlay: "0 10px 28px rgba(25,31,35,0.14)",
    elevationPopout: "0 24px 48px -12px rgba(25,31,35,0.24)",
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
