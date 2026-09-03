// components.jsx — Copan UI kit for Loft
// All shared components. Exported to window at the bottom.
// Source of truth: Copan-Components.fig (Button, Chips, Tags, Feedback-banner).

const { useState } = React;

// ───────── Logo ─────────
function LoftLogo({ size = 28, color = "currentColor" }) {
  return (
    <svg width={size * 72/61} height={size} viewBox="0 0 72 61.411" fill={color} style={{display:"block"}}>
      <path d="M 40.159 61.411 L 46.651 61.411 L 46.651 29.139 L 55.847 29.139 L 57.688 22.676 L 46.651 22.676 L 46.651 13.787 C 46.651 9.749 49.951 6.463 54.007 6.463 L 54.007 0 C 46.371 0 40.159 6.185 40.159 13.787 L 40.159 22.676 L 36.885 22.676 C 35.432 16.927 30.196 12.658 23.976 12.658 C 16.638 12.658 10.667 18.601 10.667 25.908 C 10.667 33.214 16.638 39.157 23.976 39.157 C 30.196 39.157 35.432 34.888 36.885 29.139 L 40.159 29.139 L 40.159 61.411 Z M 67.456 22.676 L 72 22.676 L 72 29.139 L 67.456 29.139 L 67.456 50.419 L 60.963 50.419 L 60.963 14.225 L 67.456 14.225 L 67.456 22.676 Z M 23.976 18.475 C 19.86 18.475 16.51 21.809 16.51 25.908 C 16.51 30.006 19.86 33.34 23.976 33.34 C 28.093 33.34 31.442 30.006 31.442 25.908 C 31.442 21.809 28.093 18.475 23.976 18.475 Z M 0 32.097 C 0 41.961 8.061 49.986 17.968 49.986 L 17.968 43.523 C 11.64 43.523 6.492 38.397 6.492 32.097 L 6.492 14.224 L 0 14.224 L 0 32.097 Z" fillRule="evenodd"/>
    </svg>
  );
}

// ───────── Icon wrapper (Lucide) ─────────
function Icon({ name, size = 20, color = "currentColor", strokeWidth = 2, style = {} }) {
  return (
    <i data-lucide={name} style={{
      width: size, height: size, color,
      display: "inline-flex",
      ...style,
    }} data-stroke-width={strokeWidth} />
  );
}

// ───────── Button ─────────
// Copan API: variant(primary|secondary) × modifier(none|inverted|premium) × size(default|contextual) × state(enabled|hover|pressed|disabled|loading)
// Primary  = filled orange, no border
// Secondary = outlined, #121619 border, white fill
// Default size = 48h, 12/24 padding, 16/24 label. Contextual = 32h, 8/16 padding, 14/20 label.
function Button({
  children,
  variant = "primary",
  modifier = "none",
  size = "default",
  icon,
  iconPosition = "before",
  disabled,
  loading,
  fullWidth,
  onClick,
  style = {},
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  const sizes = {
    default:    { h: 48, px: 24, py: 12, fs: 16, lh: 24, gap: 8, iconSize: 24, radius: 8 },
    contextual: { h: 32, px: 16, py: 8,  fs: 14, lh: 20, gap: 6, iconSize: 16, radius: 8 },
  };
  const s = sizes[size];

  // Color matrix
  const palette = {
    primary: {
      none: {
        bg: "#F56738", bgHover: "#D94616", bgPressed: "#8A2606",
        fg: "#FFFFFF", border: "transparent",
        bgDisabled: "#C1C7CD", fgDisabled: "#FFFFFF",
      },
      inverted: {
        bg: "#FFFFFF", bgHover: "#F2F4F8", bgPressed: "#E1E9EF",
        fg: "#121619", border: "transparent",
        bgDisabled: "#5A6A75", fgDisabled: "#C1C7CD",
      },
      premium: {
        bg: "#121619", bgHover: "#343A3F", bgPressed: "#000000",
        fg: "#E4B266", border: "transparent",
        bgDisabled: "#C1C7CD", fgDisabled: "#FFFFFF",
      },
    },
    secondary: {
      none: {
        bg: "#FFFFFF", bgHover: "#F2F4F8", bgPressed: "#E1E9EF",
        fg: "#121619", border: "#121619",
        bgDisabled: "#FFFFFF", fgDisabled: "#C1C7CD", borderDisabled: "#C1C7CD",
      },
      inverted: {
        bg: "transparent", bgHover: "rgba(255,255,255,0.1)", bgPressed: "rgba(255,255,255,0.2)",
        fg: "#FFFFFF", border: "#FFFFFF",
        bgDisabled: "transparent", fgDisabled: "#5A6A75", borderDisabled: "#5A6A75",
      },
      premium: {
        bg: "transparent", bgHover: "#FDF4E4", bgPressed: "#F7E6B8",
        fg: "#121619", border: "#E4B266",
        bgDisabled: "#FFFFFF", fgDisabled: "#C1C7CD", borderDisabled: "#C1C7CD",
      },
    },
  };
  const p = palette[variant]?.[modifier] ?? palette.primary.none;

  const state = disabled ? "disabled" : pressed ? "pressed" : hover ? "hover" : "enabled";
  const bg = state === "disabled" ? p.bgDisabled : state === "pressed" ? p.bgPressed : state === "hover" ? p.bgHover : p.bg;
  const fg = state === "disabled" ? p.fgDisabled : p.fg;
  const bd = state === "disabled" ? (p.borderDisabled ?? p.border) : p.border;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        background: bg,
        border: bd === "transparent" ? "none" : `1px solid ${bd}`,
        color: fg,
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: s.fs,
        lineHeight: `${s.lh}px`,
        height: s.h,
        padding: `0 ${s.px}px`,
        borderRadius: s.radius,
        cursor: (disabled || loading) ? "not-allowed" : "pointer",
        display: fullWidth ? "flex" : "inline-flex",
        width: fullWidth ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        outline: "none",
        transition: "background 180ms ease-out, border-color 180ms ease-out",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {loading && <Icon name="loader-2" size={s.iconSize} style={{ animation: "spin 1s linear infinite" }} />}
      {!loading && icon && iconPosition === "before" && <Icon name={icon} size={s.iconSize} />}
      <span>{children}</span>
      {!loading && icon && iconPosition === "after" && <Icon name={icon} size={s.iconSize} />}
    </button>
  );
}

// ───────── Action Button (icon-only) ─────────
function ActionButton({ icon, variant = "primary", size = "default", disabled, onClick, style = {}, ...rest }) {
  const sizes = {
    default:    { h: 48, iconSize: 24 },
    contextual: { h: 32, iconSize: 16 },
  };
  const s = sizes[size];
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      style={{ width: s.h, padding: 0, ...style }}
      {...rest}
    >
      <Icon name={icon} size={s.iconSize} />
    </Button>
  );
}

// ───────── Chip (filter / choice) ─────────
// API: state(enabled|hover|pressed|disabled|selected) × modifier(none|inverted)
function Chip({ children, selected = false, icon, iconPosition = "left", disabled, onClick, closable, onClose }) {
  const [hover, setHover] = useState(false);
  const bg = disabled ? "#F2F4F8" : selected ? "#121619" : hover ? "#F2F4F8" : "#FFFFFF";
  const fg = disabled ? "#A2A9B0" : selected ? "#FFFFFF" : "#121619";
  const bd = disabled ? "#E1E9EF" : selected ? "#121619" : "#C1C7CD";
  return (
    <span
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: bg,
        border: `1px solid ${bd}`,
        color: fg,
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: 14,
        lineHeight: "20px",
        padding: "6px 14px",
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
        userSelect: "none",
        transition: "all 150ms ease-out",
      }}
    >
      {icon && iconPosition === "left" && <Icon name={icon} size={16} />}
      {children}
      {icon && iconPosition === "right" && <Icon name={icon} size={16} />}
      {closable && (
        <Icon
          name="x"
          size={14}
          style={{ opacity: 0.7, marginLeft: 2, cursor: "pointer" }}
          onClick={e => { e.stopPropagation(); onClose && onClose(); }}
        />
      )}
    </span>
  );
}

// ───────── Tag (status badge) ─────────
// API: variant(neutral|informative|positive|negative|attention) × modifier(none|inverted|premium|muted)
function Tag({ children, variant = "neutral", modifier = "none", icon }) {
  const palettes = {
    neutral:     { bg: "#F2F4F8", fg: "#121619" },
    informative: { bg: "#EDF6FC", fg: "#225C8A" },
    positive:    { bg: "#E8F5F0", fg: "#115644" },
    negative:    { bg: "#FDECEC", fg: "#991818" },
    attention:   { bg: "#FFF4DF", fg: "#7A5200" },
  };
  let { bg, fg } = palettes[variant] ?? palettes.neutral;

  if (modifier === "inverted") {
    bg = "#121619"; fg = "#FFFFFF";
  } else if (modifier === "premium") {
    bg = "#121619"; fg = "#E4B266";
  } else if (modifier === "muted") {
    bg = "transparent"; fg = "#A2A9B0";
  }

  return (
    <span style={{
      background: bg,
      color: fg,
      fontFamily: "Inter, sans-serif",
      fontWeight: 700,
      fontSize: 12,
      lineHeight: "16px",
      letterSpacing: "0.02em",
      padding: "4px 10px",
      borderRadius: 999,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      whiteSpace: "nowrap",
    }}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

// ───────── Input ─────────
function Input({ label, caption, error, icon, ...rest }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? "#CE4242" : focused ? "#F56738" : "#C1C7CD";
  const borderWidth = focused || error ? 2 : 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontFamily:"Inter", fontSize:14, fontWeight:500, color:"#121619" }}>{label}</label>}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {icon && (
          <div style={{ position: "absolute", left: 12, display: "flex", color: "#697077" }}>
            <Icon name={icon} size={18} />
          </div>
        )}
        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: 48,
            padding: `0 ${14 - (borderWidth-1)}px 0 ${(icon ? 38 : 14) - (borderWidth-1)}px`,
            border: `${borderWidth}px solid ${borderColor}`,
            borderRadius: 8,
            fontFamily: "Inter",
            fontSize: 16,
            color: "#121619",
            background: error ? "#FDECEC" : "#FFFFFF",
            outline: "none",
          }}
          {...rest}
        />
      </div>
      {(caption || error) && <span style={{ fontFamily:"Inter", fontSize:12, color: error ? "#CE4242" : "#697077" }}>{error || caption}</span>}
    </div>
  );
}

// ───────── Feedback Banner ─────────
function FeedbackBanner({ variant = "informative", icon, title, children, action, onDismiss }) {
  const palettes = {
    informative: { bg: "#EDF6FC", fg: "#121619", iconColor: "#387BA8",   icon: "info" },
    positive:    { bg: "#E8F5F0", fg: "#121619", iconColor: "#20A483",   icon: "check-circle-2" },
    negative:    { bg: "#FDECEC", fg: "#121619", iconColor: "#CE4242",   icon: "alert-circle" },
    attention:   { bg: "#FFF4DF", fg: "#121619", iconColor: "#FFC04C",   icon: "alert-triangle" },
  };
  const p = palettes[variant];
  return (
    <div style={{
      background: p.bg, color: p.fg,
      borderRadius: 8,
      padding: "16px 20px",
      display: "flex", gap: 12, alignItems: "flex-start",
      fontFamily: "Inter, sans-serif",
    }}>
      <Icon name={icon || p.icon} size={20} color={p.iconColor} style={{ marginTop: 2, flex: "0 0 20px" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {title && <strong style={{ fontSize: 14, fontWeight: 700, lineHeight: "20px" }}>{title}</strong>}
        {children && <div style={{ fontSize: 14, lineHeight: "20px" }}>{children}</div>}
      </div>
      {action && (
        <button onClick={action.onClick} style={{
          background: "transparent", border: "none", padding: 0,
          color: "#20A483", fontFamily: "Inter", fontWeight: 700, fontSize: 14,
          cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3,
        }}>{action.label}</button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} style={{
          background: "transparent", border: "none", padding: 4, cursor: "pointer", color: "#697077",
          display: "flex",
        }} aria-label="Fechar">
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}

// ───────── Link ─────────
function Link({ children, href = "#", variant = "default", size = "md", onClick, icon }) {
  const variants = {
    default:     { color: "#20A483", hover: "#115644" },
    informative: { color: "#387BA8", hover: "#225C8A" },
    inverted:    { color: "#FFFFFF", hover: "#E1E9EF" },
  };
  const sizes = { sm: 12, md: 14, lg: 16 };
  const [hover, setHover] = useState(false);
  const v = variants[variant];
  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        color: hover ? v.hover : v.color,
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: sizes[size],
        lineHeight: `${sizes[size] + 6}px`,
        textDecoration: "underline",
        textUnderlineOffset: 3,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {children}
      {icon && <Icon name={icon} size={sizes[size]} />}
    </a>
  );
}

Object.assign(window, { LoftLogo, Icon, Button, ActionButton, Chip, Tag, Input, FeedbackBanner, Link });
