// app.jsx — top-level App with routing and the 3 screens

const { useState, useEffect } = React;

// ───────── Home Screen ─────────
function HomeScreen({ goto }) {
  const [intent, setIntent] = useState("comprar");
  const [where, setWhere] = useState("São Paulo");
  return (
    <div>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(180deg, #FFF2EC 0%, #FFFFFF 100%)",
        padding: "72px 48px 96px",
      }}>
        <div style={{ maxWidth: 1232, margin: "0 auto" }}>
          <div style={{ fontFamily:"Inter", fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#F56738", marginBottom:16 }}>
            Moradia sem complicação
          </div>
          <h1 style={{ fontFamily:"Inter", fontWeight:800, fontSize:64, lineHeight:"68px", letterSpacing:"-0.02em", color:"#121619", maxWidth:840 }}>
            Encontre seu próximo lar <br/>em São Paulo e Rio.
          </h1>
          <p style={{ fontFamily:"Inter", fontSize:18, lineHeight:"28px", color:"#536470", marginTop:20, maxWidth:560 }}>
            Apartamentos prontos para morar, reformados pela Loft em locais privilegiados.
          </p>

          {/* Search composer */}
          <div style={{
            marginTop: 40, background: "#FFFFFF", padding: 12,
            borderRadius: 16, boxShadow: "0 16px 32px -8px rgba(25,31,35,0.12)",
            maxWidth: 920,
          }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, padding: "0 4px" }}>
              {["comprar", "alugar", "lançamentos"].map(t => (
                <button key={t} onClick={() => setIntent(t)} style={{
                  background: intent === t ? "#121619" : "transparent",
                  color: intent === t ? "#FFFFFF" : "#121619",
                  border: "none", borderRadius: 999,
                  padding: "6px 14px", cursor: "pointer",
                  fontFamily: "Inter", fontWeight: 500, fontSize: 13,
                  textTransform: "capitalize",
                }}>{t}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div style={{ flex: 2, padding: "8px 14px", borderRight: "1px solid #E1E9EF" }}>
                <div style={{ fontFamily:"Inter", fontSize:11, fontWeight:700, color:"#697077", letterSpacing:"0.08em", textTransform:"uppercase" }}>Onde</div>
                <input value={where} onChange={e => setWhere(e.target.value)} style={{
                  width: "100%", border: "none", outline: "none", fontFamily: "Inter", fontSize: 16, fontWeight: 500, color: "#121619", padding: "4px 0", background: "transparent",
                }} />
              </div>
              <div style={{ flex: 1, padding: "8px 14px", borderRight: "1px solid #E1E9EF" }}>
                <div style={{ fontFamily:"Inter", fontSize:11, fontWeight:700, color:"#697077", letterSpacing:"0.08em", textTransform:"uppercase" }}>Quartos</div>
                <div style={{ fontFamily:"Inter", fontSize:16, fontWeight:500, color:"#121619", padding: "4px 0" }}>1 ou mais</div>
              </div>
              <div style={{ flex: 1.2, padding: "8px 14px" }}>
                <div style={{ fontFamily:"Inter", fontSize:11, fontWeight:700, color:"#697077", letterSpacing:"0.08em", textTransform:"uppercase" }}>Preço até</div>
                <div style={{ fontFamily:"Inter", fontSize:16, fontWeight:500, color:"#121619", padding: "4px 0" }}>R$ 1.500.000</div>
              </div>
              <Button variant="primary" size="lg" icon="search" onClick={() => goto("search")}>Buscar</Button>
            </div>
          </div>

          {/* Popular filters */}
          <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
            <span style={{ fontFamily:"Inter", fontSize:13, color:"#697077", alignSelf:"center", marginRight:4 }}>Populares:</span>
            {["Pinheiros", "2 quartos", "Até R$ 1M", "Com varanda", "Pet-friendly"].map(t => (
              <Chip key={t} onClick={() => goto("search")}>{t}</Chip>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section style={{ padding: "72px 48px 0" }}>
        <div style={{ maxWidth: 1232, margin: "0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily:"Inter", fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#F56738", marginBottom:8 }}>Em destaque</div>
              <h2 style={{ fontFamily:"Inter", fontWeight:700, fontSize:40, lineHeight:"44px", letterSpacing:"-0.01em", color:"#121619" }}>Apartamentos prontos pela Loft</h2>
            </div>
            <Button variant="outline" size="md" onClick={() => goto("search")}>Ver todos</Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {PHOTOS.slice(0, 4).map(p => (
              <PropertyCard key={p.id} p={p} onClick={() => goto("detail", p)} />
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section style={{ padding: "96px 48px 0" }}>
        <div style={{ maxWidth: 1232, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 48 }}>
          {[
            { h: "Reformado pela Loft", p: "Apartamentos entregues prontos para morar, com acabamento padrão Loft e garantia de 1 ano." },
            { h: "Proposta 100% online", p: "Você envia a proposta, a Loft avalia em até 48h e assina o contrato digitalmente." },
            { h: "Financiamento sem complicação", p: "Simulamos com os principais bancos e acompanhamos todo o processo até a entrega da chave." },
          ].map((vp, i) => (
            <div key={i}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "#FFF2EC", color: "#F56738",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Inter", fontWeight: 700, fontSize: 20,
                marginBottom: 20,
              }}>{i + 1}</div>
              <h3 style={{ fontFamily:"Inter", fontWeight:700, fontSize:22, lineHeight:"28px", color:"#121619" }}>{vp.h}</h3>
              <p style={{ fontFamily:"Inter", fontSize:15, lineHeight:"24px", color:"#536470", marginTop:8 }}>{vp.p}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { HomeScreen });
