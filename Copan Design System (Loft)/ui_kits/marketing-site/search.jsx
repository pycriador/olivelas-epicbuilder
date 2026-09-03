// search.jsx — Search results with filter rail

const { useState: _useSt } = React;

function FilterRail({ filters, setFilters }) {
  const toggle = (key, val) => {
    const cur = filters[key] || [];
    setFilters({ ...filters, [key]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] });
  };
  const Section = ({ title, children }) => (
    <div style={{ padding: "20px 0", borderBottom: "1px solid #E1E9EF" }}>
      <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 14, color: "#121619", marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
  const Check = ({ k, v, label, count }) => {
    const on = (filters[k] || []).includes(v);
    return (
      <div onClick={() => toggle(k, v)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 0" }}>
        <div style={{
          width: 18, height: 18, borderRadius: 4,
          border: `1.5px solid ${on ? "#F56738" : "#C1C7CD"}`,
          background: on ? "#F56738" : "#FFFFFF",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {on && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <span style={{ fontFamily: "Inter", fontSize: 14, color: "#121619", flex: 1 }}>{label}</span>
        {count && <span style={{ fontFamily: "Inter", fontSize: 12, color: "#697077" }}>{count}</span>}
      </div>
    );
  };
  return (
    <aside style={{ width: 260, flexShrink: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8 }}>
        <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 16, color: "#121619" }}>Filtros</div>
        <button onClick={() => setFilters({})} style={{
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: "Inter", fontSize: 13, color: "#20A483",
          textDecoration: "underline", textDecorationStyle: "dashed", textUnderlineOffset: 3,
        }}>Limpar</button>
      </div>
      <Section title="Tipo">
        <Check k="type" v="apt" label="Apartamento" count="1.243" />
        <Check k="type" v="casa" label="Casa" count="312" />
        <Check k="type" v="studio" label="Studio" count="188" />
      </Section>
      <Section title="Quartos">
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, "4+"].map(n => {
            const on = (filters.rooms || []).includes(String(n));
            return (
              <button key={n} onClick={() => toggle("rooms", String(n))} style={{
                flex: 1, padding: "8px 0", borderRadius: 6,
                border: `1px solid ${on ? "#121619" : "#E1E9EF"}`,
                background: on ? "#121619" : "#FFFFFF",
                color: on ? "#FFFFFF" : "#121619",
                fontFamily: "Inter", fontWeight: 500, fontSize: 14, cursor: "pointer",
              }}>{n}</button>
            );
          })}
        </div>
      </Section>
      <Section title="Preço">
        <Input placeholder="R$ mín" />
        <div style={{ height: 8 }} />
        <Input placeholder="R$ máx" />
      </Section>
      <Section title="Características">
        <Check k="feats" v="pet" label="Pet-friendly" count="421" />
        <Check k="feats" v="var" label="Com varanda" count="687" />
        <Check k="feats" v="pool" label="Piscina" count="294" />
        <Check k="feats" v="gym" label="Academia" count="512" />
      </Section>
    </aside>
  );
}

function SearchScreen({ goto }) {
  const [filters, setFilters] = _useSt({ rooms: ["2"] });
  const [sort, setSort] = _useSt("relevance");
  const activeChips = [
    { label: "Pinheiros", key: "neigh" },
    ...(filters.rooms || []).map(r => ({ label: `${r} ${r === "1" ? "quarto" : "quartos"}`, key: "rooms", val: r })),
    ...(filters.feats || []).map(f => ({ label: ({pet:"Pet-friendly",var:"Com varanda",pool:"Piscina",gym:"Academia"})[f], key: "feats", val: f })),
  ];
  return (
    <div style={{ padding: "24px 48px 0" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ fontFamily: "Inter", fontSize: 13, color: "#697077", marginBottom: 16 }}>
          <span style={{cursor:"pointer"}} onClick={() => goto("home")}>Home</span> / <span>Comprar</span> / <strong style={{ color: "#121619" }}>São Paulo</strong>
        </div>

        {/* Result summary */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily:"Inter", fontWeight:700, fontSize:32, lineHeight:"38px", letterSpacing:"-0.01em", color:"#121619" }}>Apartamentos em São Paulo</h1>
            <div style={{ fontFamily:"Inter", fontSize:14, color:"#536470", marginTop:4 }}>
              <strong style={{ color: "#121619" }}>1.243 imóveis</strong> encontrados
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily:"Inter", fontSize:13, color:"#697077" }}>Ordenar por</span>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{
              padding: "8px 12px", border: "1px solid #E1E9EF", borderRadius: 8,
              fontFamily: "Inter", fontSize: 14, color: "#121619", background: "#FFFFFF",
            }}>
              <option value="relevance">Relevância</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="area-desc">Maior área</option>
            </select>
          </div>
        </div>

        {/* Active filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {activeChips.map((c, i) => (
            <Chip key={i} active closable onClose={() => {
              if (c.key === "rooms") setFilters({ ...filters, rooms: filters.rooms.filter(r => r !== c.val) });
              if (c.key === "feats") setFilters({ ...filters, feats: (filters.feats||[]).filter(r => r !== c.val) });
            }}>{c.label}</Chip>
          ))}
          <Chip onClick={() => {}}>+ adicionar filtro</Chip>
        </div>

        {/* Body */}
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
          <FilterRail filters={filters} setFilters={setFilters} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {PHOTOS.map(p => (
                <PropertyCard key={p.id} p={p} onClick={() => goto("detail", p)} />
              ))}
            </div>
            <div style={{ textAlign: "center", margin: "40px 0" }}>
              <Button variant="outline" size="md">Carregar mais</Button>
            </div>
          </div>

          {/* Map peek */}
          <aside style={{
            width: 240, flexShrink: 0, position: "sticky", top: 96,
            borderRadius: 12, overflow: "hidden", border: "1px solid #E1E9EF",
          }}>
            <div style={{
              height: 320, position: "relative",
              background: "linear-gradient(135deg, #EDF6FC 0%, #D9E9F5 100%)",
            }}>
              <svg viewBox="0 0 240 320" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                {/* stylized streets */}
                <path d="M 0 80 L 240 120" stroke="#C1C7CD" strokeWidth="2" fill="none"/>
                <path d="M 40 0 L 80 320" stroke="#C1C7CD" strokeWidth="2" fill="none"/>
                <path d="M 180 0 L 160 320" stroke="#C1C7CD" strokeWidth="2" fill="none"/>
                <path d="M 0 200 L 240 180" stroke="#C1C7CD" strokeWidth="2" fill="none"/>
                <path d="M 0 260 L 240 280" stroke="#C1C7CD" strokeWidth="2" fill="none"/>
                {/* park */}
                <circle cx="120" cy="140" r="36" fill="#D1E8D9" />
                {/* pins */}
                {[[70,90],[140,120],[90,180],[170,200],[110,250],[180,150]].map(([x,y], i) => (
                  <g key={i}>
                    <circle cx={x} cy={y} r="14" fill="#F56738" stroke="#FFFFFF" strokeWidth="2"/>
                    <text x={x} y={y+4} fontFamily="Inter" fontSize="10" fontWeight="700" fill="#FFFFFF" textAnchor="middle">{i+1}</text>
                  </g>
                ))}
              </svg>
              <button style={{
                position: "absolute", bottom: 12, left: 12, right: 12,
                padding: "10px", borderRadius: 8, border: "1px solid #121619",
                background: "#FFFFFF", fontFamily: "Inter", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>Abrir mapa</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SearchScreen, FilterRail });
