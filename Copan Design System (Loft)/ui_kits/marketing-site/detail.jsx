// detail.jsx — Property detail screen with photo gallery and proposal drawer

const { useState: _useStD } = React;

function DetailScreen({ goto, property }) {
  const p = property || PHOTOS[0];
  const [tab, setTab] = _useStD(0);
  const [drawer, setDrawer] = _useStD(false);

  return (
    <div style={{ padding: "24px 48px 0" }}>
      <div style={{ maxWidth: 1232, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ fontFamily:"Inter", fontSize:13, color:"#697077", marginBottom:20 }}>
          <span style={{cursor:"pointer"}} onClick={() => goto("home")}>Home</span> / <span style={{cursor:"pointer"}} onClick={() => goto("search")}>Comprar</span> / <strong style={{ color:"#121619" }}>{p.neigh}</strong>
        </div>

        {/* Gallery grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "220px 220px", gap: 8, borderRadius: 16, overflow: "hidden", marginBottom: 32 }}>
          <div style={{ gridRow: "1 / 3", background: p.grad, position: "relative" }}>
            <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8 }}>
              {p.tag && <Tag variant="dark">{p.tag}</Tag>}
              {p.badge && <Tag variant="orange">{p.badge}</Tag>}
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #FFD9C7 0%, #F56738 100%)" }} />
          <div style={{ background: "linear-gradient(135deg, #E4B266 0%, #BD7B00 100%)" }} />
          <div style={{ background: "linear-gradient(135deg, #E1E9EF 0%, #A2A9B0 100%)" }} />
          <div style={{ background: "linear-gradient(135deg, #7351BA 0%, #4A2E85 100%)", position: "relative", cursor: "pointer" }}>
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Inter", fontWeight: 700, fontSize: 15, color: "#FFFFFF",
            }}>Ver todas as 24 fotos</div>
          </div>
        </div>

        {/* Main layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 48 }}>
          <div>
            {/* Title */}
            <div>
              <div style={{ fontFamily:"Inter", fontSize:13, color:"#697077" }}>Apartamento · {p.neigh}, São Paulo</div>
              <h1 style={{ fontFamily:"Inter", fontWeight:700, fontSize:40, lineHeight:"44px", letterSpacing:"-0.01em", color:"#121619", marginTop: 4 }}>
                {p.rooms} {p.rooms === 1 ? "quarto" : "quartos"} com {p.area}m² em {p.neigh}
              </h1>
              <div style={{ display: "flex", gap: 24, marginTop: 20, paddingBottom: 24, borderBottom: "1px solid #E1E9EF" }}>
                {[
                  { label: "Área", val: `${p.area} m²` },
                  { label: "Quartos", val: p.rooms },
                  { label: "Banheiros", val: p.rooms >= 2 ? 2 : 1 },
                  { label: "Vagas", val: 1 },
                  { label: "Andar", val: `${Math.floor(Math.random()*15)+3}º` },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ fontFamily:"Inter", fontSize:12, color:"#697077", textTransform:"uppercase", letterSpacing:"0.04em" }}>{m.label}</div>
                    <div style={{ fontFamily:"Inter", fontWeight:700, fontSize:18, color:"#121619", marginTop:2 }}>{m.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:32, borderBottom:"1px solid #E1E9EF", marginTop:32 }}>
              {["Sobre", "Comodidades", "Localização", "Financiamento"].map((t, i) => (
                <button key={t} onClick={() => setTab(i)} style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  padding: "12px 0",
                  fontFamily: "Inter", fontWeight: tab === i ? 700 : 500, fontSize: 15,
                  color: tab === i ? "#121619" : "#697077",
                  borderBottom: `2px solid ${tab === i ? "#F56738" : "transparent"}`,
                  marginBottom: -1,
                }}>{t}</button>
              ))}
            </div>

            <div style={{ paddingTop: 24, minHeight: 220 }}>
              {tab === 0 && (
                <div>
                  <p style={{ fontFamily:"Inter", fontSize:16, lineHeight:"26px", color:"#343A3F" }}>
                    Apartamento reformado pela Loft em {p.neigh}, um dos bairros mais procurados de São Paulo. Com {p.area}m² distribuídos em {p.rooms} {p.rooms === 1 ? "quarto" : "quartos"}, o imóvel oferece acabamento padrão Loft e está pronto para morar.
                  </p>
                  <p style={{ fontFamily:"Inter", fontSize:16, lineHeight:"26px", color:"#343A3F", marginTop:16 }}>
                    O prédio conta com infraestrutura completa e está a poucos metros do metrô, ciclovia e parques da região.
                  </p>
                </div>
              )}
              {tab === 1 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {["Piscina", "Academia", "Portaria 24h", "Salão de festas", "Churrasqueira", "Playground", "Bicicletário", "Pet space", "Lavanderia compartilhada"].map(c => (
                    <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 999, background: "#FFF2EC", color: "#F56738", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>✓</div>
                      <span style={{ fontFamily: "Inter", fontSize: 15, color: "#121619" }}>{c}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === 2 && (
                <div style={{ background: "linear-gradient(135deg, #EDF6FC 0%, #D9E9F5 100%)", height: 280, borderRadius: 12, position: "relative" }}>
                  <svg viewBox="0 0 600 280" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                    <path d="M 0 100 L 600 140" stroke="#C1C7CD" strokeWidth="2" fill="none"/>
                    <path d="M 100 0 L 200 280" stroke="#C1C7CD" strokeWidth="2" fill="none"/>
                    <path d="M 380 0 L 340 280" stroke="#C1C7CD" strokeWidth="2" fill="none"/>
                    <circle cx="300" cy="140" r="24" fill="#F56738" stroke="#FFFFFF" strokeWidth="3"/>
                  </svg>
                </div>
              )}
              {tab === 3 && (
                <div style={{ background: "#F2F4F8", padding: 24, borderRadius: 12 }}>
                  <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 18, color: "#121619" }}>Simulador de financiamento</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                    <Input label="Entrada" caption="20% do valor do imóvel" defaultValue={`R$ ${Math.round(p.price * 0.2).toLocaleString("pt-BR")}`} />
                    <Input label="Prazo" caption="Até 420 meses" defaultValue="360 meses" />
                  </div>
                  <div style={{ marginTop: 24, padding: "16px 20px", background: "#FFFFFF", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: "Inter", fontSize: 13, color: "#697077" }}>Parcela estimada</div>
                      <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 22, color: "#F56738", marginTop: 2 }}>R$ {Math.round(p.price * 0.8 / 360 * 1.8).toLocaleString("pt-BR")}/mês</div>
                    </div>
                    <Button variant="dark" size="md">Simular com bancos</Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky proposal card */}
          <aside style={{ position: "sticky", top: 96, height: "fit-content" }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #E1E9EF", borderRadius: 16, padding: 24, boxShadow: "0 8px 24px -6px rgba(25,31,35,0.08)" }}>
              <div style={{ fontFamily:"Inter", fontWeight:700, fontSize:28, lineHeight:"34px", color:"#121619" }}>
                {currency(p.price)}
              </div>
              {p.discount && (
                <div style={{ fontFamily:"Inter", fontSize:13, color:"#697077", marginTop:4 }}>
                  <span style={{ textDecoration:"line-through" }}>{currency(p.discount)}</span>
                  <span style={{ color: "#20A483", fontWeight: 700, marginLeft: 8 }}>−{Math.round((1 - p.price/p.discount)*100)}%</span>
                </div>
              )}
              <div style={{ fontFamily:"Inter", fontSize:13, color:"#536470", marginTop: 16, padding: "12px 14px", background: "#F2F4F8", borderRadius: 8 }}>
                Condomínio R$ 680 · IPTU R$ 215
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
                <Button variant="primary" size="lg" onClick={() => setDrawer(true)}>Enviar proposta</Button>
                <Button variant="outline" size="lg" icon="calendar">Agendar visita</Button>
              </div>
              <div style={{ marginTop: 20, padding: "12px 0", borderTop: "1px solid #E1E9EF", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 999, background: "linear-gradient(135deg, #F56738, #D94616)" }} />
                <div>
                  <div style={{ fontFamily:"Inter", fontWeight:700, fontSize:14, color:"#121619" }}>Mariana Costa</div>
                  <div style={{ fontFamily:"Inter", fontSize:12, color:"#697077" }}>Consultora Loft · responde em ~2h</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Drawer */}
      {drawer && (
        <>
          <div onClick={() => setDrawer(false)} style={{
            position: "fixed", inset: 0, background: "rgba(25,31,35,0.5)", zIndex: 20,
          }} />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 480,
            background: "#FFFFFF", zIndex: 21, padding: 40, overflow: "auto",
            boxShadow: "0 24px 48px -12px rgba(25,31,35,0.24)",
          }}>
            <button onClick={() => setDrawer(false)} style={{
              position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 999,
              background: "#F2F4F8", border: "none", cursor: "pointer", fontSize: 18, color: "#121619",
            }}>×</button>
            <div style={{ fontFamily:"Inter", fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#F56738" }}>Nova proposta</div>
            <h2 style={{ fontFamily:"Inter", fontWeight:700, fontSize:28, lineHeight:"32px", letterSpacing:"-0.01em", color:"#121619", marginTop: 8 }}>
              Proposta para {p.neigh}
            </h2>
            <p style={{ fontFamily:"Inter", fontSize:14, color:"#536470", marginTop: 8 }}>O proprietário tem até 48h para responder.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
              <Input label="Valor da proposta" defaultValue={currency(Math.round(p.price * 0.97))} caption={`Valor anunciado: ${currency(p.price)}`} />
              <Input label="Forma de pagamento" defaultValue="Financiamento" />
              <Input label="Condições adicionais" placeholder="Ex.: condicionado à vistoria" caption="Opcional." />
            </div>
            <div style={{ marginTop: 32, padding: "12px 14px", background: "#EDF6FC", borderLeft: "3px solid #20A483", borderRadius: 4, fontFamily: "Inter", fontSize: 13, lineHeight: "18px", color: "#115644" }}>
              Sua proposta é válida por 7 dias corridos a partir do envio.
            </div>
            <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
              <Button variant="outline" size="lg" onClick={() => setDrawer(false)}>Cancelar</Button>
              <Button variant="primary" size="lg" style={{ flex: 1 }} onClick={() => { alert("Proposta enviada!"); setDrawer(false); }}>Enviar proposta</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { DetailScreen });
