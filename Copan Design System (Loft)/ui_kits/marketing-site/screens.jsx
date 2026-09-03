// screens.jsx — Header, Footer, PropertyCard, and the 3 screens

const { useState: _useState, useEffect: _useEffect } = React;

// Stock "photos" — duotone gradients named by mood
const PHOTOS = [
  { id: 1, neigh: "Pinheiros", rooms: 2, area: 62, price: 1245000, discount: null, grad: "linear-gradient(135deg, #E4B266 0%, #F56738 100%)", tag: "Pronto p/ morar", badge: null },
  { id: 2, neigh: "Vila Madalena", rooms: 1, area: 48, price: 890000, discount: 950000, grad: "linear-gradient(135deg, #7351BA 0%, #20A483 100%)", tag: null, badge: "Oferta Loft" },
  { id: 3, neigh: "Itaim Bibi", rooms: 3, area: 98, price: 2180000, discount: null, grad: "linear-gradient(135deg, #536470 0%, #191F23 100%)", tag: "Pronto p/ morar", badge: null },
  { id: 4, neigh: "Jardins", rooms: 2, area: 72, price: 1560000, discount: null, grad: "linear-gradient(135deg, #FFA782 0%, #D94616 100%)", tag: null, badge: null },
  { id: 5, neigh: "Perdizes", rooms: 2, area: 68, price: 1120000, discount: 1180000, grad: "linear-gradient(135deg, #20A483 0%, #115644 100%)", tag: null, badge: "Oferta Loft" },
  { id: 6, neigh: "Moema", rooms: 3, area: 104, price: 1890000, discount: null, grad: "linear-gradient(135deg, #E4B266 0%, #7A5200 100%)", tag: "Pronto p/ morar", badge: null },
  { id: 7, neigh: "Pinheiros", rooms: 1, area: 42, price: 720000, discount: null, grad: "linear-gradient(135deg, #FFD9C7 0%, #F56738 100%)", tag: null, badge: null },
  { id: 8, neigh: "Vila Mariana", rooms: 2, area: 58, price: 950000, discount: null, grad: "linear-gradient(135deg, #C1C7CD 0%, #536470 100%)", tag: null, badge: null },
];

function currency(n) {
  return "R$ " + n.toLocaleString("pt-BR");
}

// ───────── Header ─────────
function Header({ route, goto }) {
  const links = [
    { k: "home", label: "Comprar" },
    { k: "search", label: "Alugar" },
    { k: "sell", label: "Vender" },
    { k: "finance", label: "Financiar" },
    { k: "about", label: "Sobre" },
  ];
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 10,
      background: "#FFFFFF", borderBottom: "1px solid #E1E9EF",
      height: 72, display: "flex", alignItems: "center",
      padding: "0 48px", gap: 40,
    }}>
      <div onClick={() => goto("home")} style={{ cursor: "pointer", color: "#121619" }}>
        <LoftLogo size={28} />
      </div>
      <nav style={{ display: "flex", gap: 28, flex: 1 }}>
        {links.map(l => (
          <a key={l.k} onClick={() => goto(l.k === "sell" || l.k === "finance" || l.k === "about" ? "home" : l.k)} style={{
            fontFamily: "Inter", fontWeight: 500, fontSize: 14, cursor: "pointer",
            color: route === l.k ? "#F56738" : "#121619",
            textDecoration: route === l.k ? "underline" : "none",
            textDecorationStyle: "dashed", textUnderlineOffset: 4,
            fontWeight: route === l.k ? 700 : 500,
          }}>{l.label}</a>
        ))}
      </nav>
      <button style={{
        background: "transparent", border: "none", color: "#121619",
        fontFamily: "Inter", fontWeight: 500, fontSize: 14, cursor: "pointer",
      }}>Entrar</button>
      <Button variant="primary" size="md">Anunciar imóvel</Button>
    </header>
  );
}

// ───────── Footer ─────────
function Footer() {
  return (
    <footer style={{ background: "#121619", color: "#FFFFFF", padding: "56px 48px 32px", marginTop: 96 }}>
      <div style={{ maxWidth: 1232, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 48 }}>
        <div style={{ gridColumn: "1 / 2" }}>
          <div style={{ color: "#FFFFFF" }}><LoftLogo size={32} color="#FFFFFF" /></div>
          <p style={{ fontFamily: "Inter", fontSize: 14, lineHeight: "22px", color: "#A2A9B0", marginTop: 16, maxWidth: 240 }}>
            Um jeito novo de morar. Moradia pronta em São Paulo e Rio de Janeiro.
          </p>
        </div>
        {[
          { title: "Produtos", links: ["Comprar imóvel", "Alugar imóvel", "Financiamento", "Simulador"] },
          { title: "Empresa",  links: ["Sobre a Loft", "Carreiras", "Imprensa", "Blog"] },
          { title: "Ajuda",    links: ["Central de ajuda", "Fale com a Loft", "Termos", "Privacidade"] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 13, color: "#FFFFFF", marginBottom: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>{col.title}</div>
            {col.links.map(l => (
              <div key={l} style={{ fontFamily: "Inter", fontSize: 14, lineHeight: "28px", color: "#C1C7CD", cursor: "pointer" }}>{l}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1232, margin: "48px auto 0", paddingTop: 24, borderTop: "1px solid #343A3F", display: "flex", justifyContent: "space-between", fontFamily: "Inter", fontSize: 12, color: "#697077" }}>
        <span>© 2026 Loft Holding S.A. · CNPJ 29.132.572/0001-98</span>
        <span>São Paulo · Rio de Janeiro</span>
      </div>
    </footer>
  );
}

// ───────── Property Card ─────────
function PropertyCard({ p, onClick }) {
  const [hover, setHover] = _useState(false);
  const [fav, setFav] = _useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: "#FFFFFF", borderRadius: 12, overflow: "hidden", cursor: "pointer",
        boxShadow: hover ? "0 8px 24px -6px rgba(25,31,35,0.16)" : "0 2px 6px 0 rgba(25,31,35,0.08)",
        transition: "box-shadow 180ms ease-out",
      }}>
      <div style={{ height: 200, background: p.grad, position: "relative" }}>
        {p.tag && <div style={{ position: "absolute", top: 12, left: 12 }}><Tag variant="dark">{p.tag}</Tag></div>}
        {p.badge && <div style={{ position: "absolute", top: 12, left: 12 }}><Tag variant="orange">{p.badge}</Tag></div>}
        <button onClick={e => { e.stopPropagation(); setFav(!fav); }} style={{
          position: "absolute", top: 12, right: 12,
          width: 36, height: 36, borderRadius: 999,
          background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? "#F56738" : "none"} stroke={fav ? "#F56738" : "#121619"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 18, lineHeight: "24px" }}>
          {currency(p.price)}
          {p.discount && (
            <span style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 13, color: "#697077", textDecoration: "line-through", marginLeft: 8 }}>
              {currency(p.discount)}
            </span>
          )}
        </div>
        <div style={{ fontFamily: "Inter", fontSize: 14, lineHeight: "20px", color: "#697077", marginTop: 4 }}>
          {p.neigh} · {p.area}m² · {p.rooms} {p.rooms === 1 ? "quarto" : "quartos"}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PHOTOS, currency, Header, Footer, PropertyCard });
