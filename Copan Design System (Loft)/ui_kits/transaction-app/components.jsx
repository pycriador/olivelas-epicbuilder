// components.jsx — Copan UI kit · Transaction app
// Shared shell pieces. Heavier components are inlined in screen files.

const { useState: useStC, useEffect: useEfC } = React;

// Loft logo
function LoftLogo({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size * 72/61} height={size} viewBox="0 0 72 61.411" fill={color} style={{display:"block"}}>
      <path d="M 40.159 61.411 L 46.651 61.411 L 46.651 29.139 L 55.847 29.139 L 57.688 22.676 L 46.651 22.676 L 46.651 13.787 C 46.651 9.749 49.951 6.463 54.007 6.463 L 54.007 0 C 46.371 0 40.159 6.185 40.159 13.787 L 40.159 22.676 L 36.885 22.676 C 35.432 16.927 30.196 12.658 23.976 12.658 C 16.638 12.658 10.667 18.601 10.667 25.908 C 10.667 33.214 16.638 39.157 23.976 39.157 C 30.196 39.157 35.432 34.888 36.885 29.139 L 40.159 29.139 L 40.159 61.411 Z M 67.456 22.676 L 72 22.676 L 72 29.139 L 67.456 29.139 L 67.456 50.419 L 60.963 50.419 L 60.963 14.225 L 67.456 14.225 L 67.456 22.676 Z M 23.976 18.475 C 19.86 18.475 16.51 21.809 16.51 25.908 C 16.51 30.006 19.86 33.34 23.976 33.34 C 28.093 33.34 31.442 30.006 31.442 25.908 C 31.442 21.809 28.093 18.475 23.976 18.475 Z M 0 32.097 C 0 41.961 8.061 49.986 17.968 49.986 L 17.968 43.523 C 11.64 43.523 6.492 38.397 6.492 32.097 L 6.492 14.224 L 0 14.224 L 0 32.097 Z" fillRule="evenodd"/>
    </svg>
  );
}

function Ico({ name, size = 18, color = "currentColor", style = {} }) {
  return <i data-lucide={name} style={{ width: size, height: size, color, display: "inline-flex", ...style }} />;
}

// ───────── Sidebar ─────────
function Sidebar({ route, goto }) {
  const items = [
    { id: "dashboard",   label: "Dashboard",   icon: "layout-dashboard" },
    { id: "proposal",    label: "Proposta",    icon: "file-signature", badge: "5" },
    { id: "documents",   label: "Documentos",  icon: "folder", badge: "2" },
    { id: "messages",    label: "Mensagens",   icon: "message-square" },
  ];
  const support = [
    { id: "contracts",   label: "Contratos",   icon: "scroll-text", disabled: true },
    { id: "settings",    label: "Configurações", icon: "settings-2", disabled: true },
  ];

  const Item = ({ it }) => {
    const active = route === it.id;
    return (
      <button
        disabled={it.disabled}
        onClick={() => !it.disabled && goto(it.id)}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px", borderRadius: 10, border: "none",
          background: active ? "#FFE5D6" : "transparent",
          color: active ? "#8A2606" : it.disabled ? "#A2A9B0" : "#121619",
          fontFamily: "Inter", fontSize: 14, fontWeight: active ? 600 : 500,
          cursor: it.disabled ? "not-allowed" : "pointer",
          width: "100%", textAlign: "left",
          position: "relative",
        }}
        onMouseEnter={e => { if (!active && !it.disabled) e.currentTarget.style.background = "#F2F4F8"; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        <Ico name={it.icon} size={18} />
        <span style={{ flex: 1 }}>{it.label}</span>
        {it.badge && (
          <span style={{ background: active ? "#F56738" : "#E1E9EF", color: active ? "#FFF" : "#121619", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>{it.badge}</span>
        )}
      </button>
    );
  };

  return (
    <aside style={{
      width: 248, background: "#FFFFFF", borderRight: "1px solid #E1E9EF",
      display: "flex", flexDirection: "column", padding: "20px 14px",
      position: "sticky", top: 0, height: "100vh", flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 20px", borderBottom: "1px solid #E1E9EF", marginBottom: 16 }}>
        <LoftLogo size={26} color="#121619" />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#121619", lineHeight: "16px" }}>Transações</div>
          <div style={{ fontSize: 11, color: "#697077", lineHeight: "14px" }}>Proposta #2841</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map(it => <Item key={it.id} it={it} />)}
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#878D96", padding: "20px 14px 8px" }}>Suporte</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {support.map(it => <Item key={it.id} it={it} />)}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ background: "#F2F4F8", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 32, height: 32, borderRadius: 999, background: "#115644", color: "#FFF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>CT</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#121619", lineHeight: "16px" }}>Carla Tavares</div>
            <div style={{ fontSize: 11, color: "#697077", lineHeight: "14px" }}>Sua especialista</div>
          </div>
          <button style={{ background: "#F56738", color: "#FFF", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Ico name="phone" size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ───────── Topbar ─────────
function Topbar({ title, subtitle, breadcrumbs }) {
  return (
    <header style={{
      background: "#FFFFFF", borderBottom: "1px solid #E1E9EF",
      padding: "20px 32px", display: "flex", alignItems: "center", gap: 16,
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <div style={{ flex: 1 }}>
        {breadcrumbs && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#697077", marginBottom: 4 }}>
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                <span style={{ color: i === breadcrumbs.length - 1 ? "#121619" : "#697077", fontWeight: i === breadcrumbs.length - 1 ? 600 : 400 }}>{b}</span>
                {i < breadcrumbs.length - 1 && <span style={{ color: "#C1C7CD" }}>/</span>}
              </React.Fragment>
            ))}
          </div>
        )}
        <div style={{ fontSize: 22, fontWeight: 700, color: "#121619", lineHeight: "28px" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: "#697077", marginTop: 2 }}>{subtitle}</div>}
      </div>

      <div style={{ position: "relative" }}>
        <input placeholder="Buscar propostas, imóveis…" style={{
          width: 280, height: 40, padding: "0 14px 0 38px",
          border: "1px solid #C1C7CD", borderRadius: 8,
          fontFamily: "Inter", fontSize: 14, color: "#121619",
          background: "#FAFBFC", outline: "none",
        }} />
        <Ico name="search" size={16} style={{ position: "absolute", left: 12, top: 12, color: "#697077" }} />
      </div>

      <button style={{ position: "relative", width: 40, height: 40, borderRadius: 8, border: "1px solid #E1E9EF", background: "#FFF", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#121619" }}>
        <Ico name="bell" size={18} />
        <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 999, background: "#F56738", border: "2px solid #FFF" }}></span>
      </button>
    </header>
  );
}

// ───────── Stat card ─────────
function StatCard({ label, value, delta, hint, icon, accent = "neutral" }) {
  const accents = {
    neutral: { bg: "#F2F4F8", fg: "#121619" },
    orange:  { bg: "#FFE5D6", fg: "#D94616" },
    green:   { bg: "#DEF5E5", fg: "#115644" },
    blue:    { bg: "#DDEEF8", fg: "#225C8A" },
    purple:  { bg: "#EAF3F9", fg: "#1F4E73" },
  };
  const a = accents[accent];
  return (
    <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#697077", letterSpacing: "0.02em" }}>{label}</span>
        <span style={{ width: 32, height: 32, borderRadius: 8, background: a.bg, color: a.fg, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Ico name={icon} size={16} /></span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#121619", lineHeight: "32px", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
        {delta && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: delta.startsWith("+") ? "#115644" : "#8F2828", fontWeight: 600 }}>
            <Ico name={delta.startsWith("+") ? "trending-up" : "trending-down"} size={12} /> {delta}
          </span>
        )}
        <span style={{ color: "#697077" }}>{hint}</span>
      </div>
    </div>
  );
}

// ───────── Status pill ─────────
function StatusPill({ tone = "neutral", children, dot = true }) {
  const tones = {
    positive:  { bg: "#DEF5E5", fg: "#115644", dot: "#20A483" },
    attention: { bg: "#FFF4DF", fg: "#7A5200", dot: "#FFC04C" },
    negative:  { bg: "#FDECEC", fg: "#8F2828", dot: "#CE4242" },
    info:      { bg: "#EAF3F9", fg: "#1F4E73", dot: "#4B94C5" },
    pending:   { bg: "#EAF3F9", fg: "#1F4E73", dot: "#4B94C5" },
    neutral:   { bg: "#F2F4F8", fg: "#121619", dot: "#878D96" },
  };
  const t = tones[tone];
  return (
    <span style={{ background: t.bg, color: t.fg, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6, lineHeight: "18px", whiteSpace: "nowrap" }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: t.dot }}></span>}
      {children}
    </span>
  );
}

// ───────── Stepper (vertical timeline) ─────────
function Stepper({ steps, current }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {steps.map((s, i) => {
        const status = i < current ? "done" : i === current ? "active" : "pending";
        return (
          <div key={i} style={{ display: "flex", gap: 14, position: "relative", paddingBottom: i === steps.length - 1 ? 0 : 22 }}>
            {i < steps.length - 1 && <div style={{ position: "absolute", left: 13, top: 28, bottom: 0, width: 2, background: i < current ? "#20A483" : "#E1E9EF" }}></div>}
            <div style={{
              width: 28, height: 28, borderRadius: 999, flexShrink: 0,
              background: status === "done" ? "#20A483" : status === "active" ? "#FFF" : "#FFF",
              border: status === "active" ? "2px solid #F56738" : status === "pending" ? "2px solid #C1C7CD" : "none",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: status === "done" ? "#FFF" : status === "active" ? "#F56738" : "#878D96",
              fontSize: 12, fontWeight: 700,
              boxShadow: status === "active" ? "0 0 0 4px #FFE5D6" : "none",
            }}>
              {status === "done" ? <Ico name="check" size={14} /> : i + 1}
            </div>
            <div style={{ flex: 1, paddingTop: 2 }}>
              <div style={{ fontSize: 14, fontWeight: status === "active" ? 700 : 600, color: status === "pending" ? "#878D96" : "#121619", lineHeight: "18px" }}>{s.title}</div>
              <div style={{ fontSize: 12, color: "#697077", marginTop: 2, lineHeight: "18px" }}>{s.desc}</div>
              {s.meta && <div style={{ fontSize: 11, color: "#878D96", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{s.meta}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { LoftLogo, Ico, Sidebar, Topbar, StatCard, StatusPill, Stepper });
