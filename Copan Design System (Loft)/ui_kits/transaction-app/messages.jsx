// messages.jsx — Conversa entre comprador e time Loft

const { useState: useStM, useRef: useRfM, useEffect: useEfM } = React;

function MessagesScreen({ goto }) {
  const [active, setActive] = useStM("carla");
  const [draft, setDraft] = useStM("");

  const threads = [
    { id: "carla", name: "Carla Tavares", role: "Especialista de transação", initials: "CT", color: "#115644", last: "Recebi os documentos, vou validar agora.", at: "agora", unread: 0, online: true },
    { id: "rafael", name: "Rafael Andrade", role: "Análise jurídica", initials: "RA", color: "#4B94C5", last: "Posso revisar a matrícula amanhã às 10h?", at: "13:42", unread: 2, online: true },
    { id: "caixa", name: "João Mauro · Caixa", role: "Banco financiador", initials: "JM", color: "#225C8A", last: "Aprovação preliminar enviada por e-mail.", at: "ontem", unread: 0, online: false },
    { id: "vistoria", name: "Eng. Paulo Reis", role: "Vistoria técnica", initials: "PR", color: "#D94616", last: "Confirmado para 23 abr às 10h.", at: "ontem", unread: 0, online: false },
  ];

  const messages = [
    { kind: "system", text: "Conversa iniciada · Proposta #2841", at: "14 abr · 09:33" },
    { from: "them", text: "Oi Mariana! Sou a Carla, vou te acompanhar em todo o processo de compra do apartamento em Pinheiros. Bem-vinda à Loft 🏡", at: "14 abr · 09:35" },
    { from: "me", text: "Obrigada, Carla! Estou animada. Acabei de enviar os primeiros documentos.", at: "14 abr · 09:38", read: true },
    { from: "them", text: "Recebido. Já comecei a validar. Posso te confirmar o prazo da próxima etapa por aqui ainda hoje.", at: "14 abr · 09:42" },
    { kind: "card", at: "15 abr · 14:08", title: "Proposta aceita pelo vendedor", subtitle: "Loft Holding S.A. · R$ 1.245.000", icon: "handshake", color: "#D94616", bg: "#FFE5D6", action: "Ver proposta" },
    { from: "them", text: "🎉 O vendedor aceitou! Agora precisamos dos documentos de comprovação de renda para liberar a próxima etapa. Veja a lista no painel.", at: "15 abr · 14:10" },
    { from: "me", text: "Vou enviar até amanhã. Os holerites de fevereiro estão na minha empresa, peço hoje.", at: "15 abr · 16:55", read: true },
    { from: "them", text: "Perfeito! Você tem até 22 abr para enviar todos. Qualquer dúvida me chama.", at: "15 abr · 16:58" },
    { kind: "card", at: "16 abr · 18:42", title: "Documento enviado · Extrato bancário", subtitle: "3.8 MB · em análise", icon: "file-up", color: "#387BA8", bg: "#DDEEF8" },
    { from: "them", text: "Recebi os documentos, vou validar agora.", at: "16 abr · 18:45" },
  ];

  const scrollerRef = useRfM(null);
  useEfM(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    if (window.lucide) setTimeout(() => window.lucide.createIcons(), 50);
  }, [active]);

  const sel = threads.find(t => t.id === active);

  return (
    <div style={{ padding: 32, height: "calc(100vh - 88px)", boxSizing: "border-box" }}>
      <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 12, height: "100%", display: "grid", gridTemplateColumns: "320px 1fr 280px", overflow: "hidden" }}>

        {/* Threads list */}
        <div style={{ borderRight: "1px solid #E1E9EF", display: "flex", flexDirection: "column", background: "#FAFBFC" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid #E1E9EF", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#121619" }}>Conversas</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#697077", background: "#E1E9EF", padding: "2px 8px", borderRadius: 999 }}>{threads.length}</span>
          </div>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #E1E9EF", position: "relative" }}>
            <input placeholder="Buscar…" style={{ width: "100%", height: 36, padding: "0 12px 0 32px", border: "1px solid #E1E9EF", borderRadius: 6, fontFamily: "Inter", fontSize: 13, background: "#FFF", outline: "none" }} />
            <Ico name="search" size={14} style={{ position: "absolute", left: 22, top: 21, color: "#697077" }} />
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            {threads.map(t => {
              const sel = active === t.id;
              return (
                <div key={t.id} onClick={() => setActive(t.id)} style={{
                  padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer",
                  background: sel ? "#FFF" : "transparent",
                  borderLeft: sel ? "3px solid #F56738" : "3px solid transparent",
                  borderBottom: "1px solid #F2F4F8",
                }}>
                  <span style={{ position: "relative", flexShrink: 0 }}>
                    <span style={{ width: 36, height: 36, borderRadius: 999, background: t.color, color: "#FFF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{t.initials}</span>
                    {t.online && <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: 999, background: "#20A483", border: "2px solid #FFF" }}></span>}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#121619", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                      <span style={{ fontSize: 11, color: "#878D96", flexShrink: 0 }}>{t.at}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#697077" }}>{t.role}</div>
                    <div style={{ fontSize: 12, color: "#697077", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.last}</div>
                  </div>
                  {t.unread > 0 && <span style={{ background: "#F56738", color: "#FFF", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, alignSelf: "center" }}>{t.unread}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active conversation */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #E1E9EF", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ position: "relative" }}>
              <span style={{ width: 40, height: 40, borderRadius: 999, background: sel.color, color: "#FFF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>{sel.initials}</span>
              {sel.online && <span style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: 999, background: "#20A483", border: "2px solid #FFF" }}></span>}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#121619" }}>{sel.name}</div>
              <div style={{ fontSize: 12, color: sel.online ? "#115644" : "#697077", display: "flex", alignItems: "center", gap: 4 }}>
                {sel.online && <span style={{ width: 6, height: 6, borderRadius: 999, background: "#20A483" }}></span>}
                {sel.online ? `${sel.role} · online · responde em ~5min` : sel.role}
              </div>
            </div>
            <button style={{ width: 36, height: 36, border: "1px solid #E1E9EF", background: "#FFF", borderRadius: 8, cursor: "pointer", color: "#121619", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Ico name="phone" size={14} /></button>
            <button style={{ width: 36, height: 36, border: "1px solid #E1E9EF", background: "#FFF", borderRadius: 8, cursor: "pointer", color: "#121619", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Ico name="video" size={14} /></button>
            <button style={{ width: 36, height: 36, border: "1px solid #E1E9EF", background: "#FFF", borderRadius: 8, cursor: "pointer", color: "#697077", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Ico name="more-horizontal" size={14} /></button>
          </div>

          <div ref={scrollerRef} style={{ flex: 1, overflow: "auto", padding: "20px 24px", background: "#FAFBFC", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m, i) => {
              if (m.kind === "system") {
                return (
                  <div key={i} style={{ alignSelf: "center", fontSize: 11, color: "#878D96", background: "#E1E9EF", padding: "4px 12px", borderRadius: 999 }}>{m.text} · {m.at}</div>
                );
              }
              if (m.kind === "card") {
                return (
                  <div key={i} style={{ alignSelf: "center", maxWidth: "70%", background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <span style={{ width: 36, height: 36, borderRadius: 8, background: m.bg, color: m.color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Ico name={m.icon} size={16} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#121619" }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: "#697077", marginTop: 2 }}>{m.subtitle}</div>
                    </div>
                    {m.action && (
                      <button style={{ background: "transparent", border: "none", color: "#387BA8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{m.action} →</button>
                    )}
                  </div>
                );
              }
              const me = m.from === "me";
              return (
                <div key={i} style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: "65%" }}>
                  <div style={{
                    background: me ? "#121619" : "#FFF",
                    color: me ? "#FFF" : "#121619",
                    padding: "10px 14px",
                    borderRadius: me ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    fontSize: 14, lineHeight: "20px",
                    border: me ? "none" : "1px solid #E1E9EF",
                  }}>{m.text}</div>
                  <div style={{ fontSize: 10, color: "#878D96", marginTop: 4, padding: me ? "0 4px 0 0" : "0 0 0 4px", textAlign: me ? "right" : "left", display: "flex", justifyContent: me ? "flex-end" : "flex-start", gap: 4, alignItems: "center" }}>
                    {m.at}
                    {me && m.read && <Ico name="check-check" size={11} color="#387BA8" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: "12px 24px", borderTop: "1px solid #E1E9EF", display: "flex", gap: 10, alignItems: "flex-end", background: "#FFF" }}>
            <button style={{ width: 40, height: 40, border: "1px solid #E1E9EF", background: "#FFF", borderRadius: 8, cursor: "pointer", color: "#697077", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico name="paperclip" size={16} /></button>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Escreva uma mensagem…"
              rows={1}
              style={{ flex: 1, padding: "10px 14px", border: "1px solid #C1C7CD", borderRadius: 8, fontFamily: "Inter", fontSize: 14, lineHeight: "20px", color: "#121619", outline: "none", resize: "none", minHeight: 40, maxHeight: 120 }}
            />
            <button style={{ width: 40, height: 40, border: "1px solid #E1E9EF", background: "#FFF", borderRadius: 8, cursor: "pointer", color: "#697077", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico name="smile" size={16} /></button>
            <button disabled={!draft.trim()} style={{ width: 40, height: 40, border: "none", background: draft.trim() ? "#F56738" : "#C1C7CD", borderRadius: 8, cursor: draft.trim() ? "pointer" : "not-allowed", color: "#FFF", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico name="send-horizontal" size={16} /></button>
          </div>
        </div>

        {/* Right pane — context */}
        <div style={{ borderLeft: "1px solid #E1E9EF", padding: 20, background: "#FAFBFC", overflow: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#697077", marginBottom: 10 }}>Sobre a transação</div>
          <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#697077", marginBottom: 4 }}>Proposta #2841</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#121619", lineHeight: "18px" }}>Pinheiros · 62m²</div>
            <div style={{ fontSize: 12, color: "#697077", marginTop: 2 }}>Rua Cardeal Arcoverde, 1200</div>
            <div style={{ marginTop: 10 }}>
              <StatusPill tone="attention">Documentos pendentes</StatusPill>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#697077", marginBottom: 10 }}>Próximos prazos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Envio de documentos", date: "22 abr", urgent: true },
              { label: "Vistoria técnica", date: "23 abr · 10h" },
              { label: "Análise jurídica", date: "26 abr" },
            ].map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: d.urgent ? "#FFF7F2" : "#FFF", border: `1px solid ${d.urgent ? "#FFD9C7" : "#E1E9EF"}`, borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#697077" }}>{d.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: d.urgent ? "#D94616" : "#121619" }}>{d.date}</div>
                </div>
                {d.urgent && <Ico name="alert-circle" size={14} color="#D94616" style={{ alignSelf: "center" }} />}
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#697077", marginBottom: 10 }}>Arquivos compartilhados</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { name: "Proposta-2841.pdf", size: "184 KB" },
              { name: "Matricula-imovel.pdf", size: "1.1 MB" },
              { name: "Simulacao-Caixa.pdf", size: "92 KB" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 8, cursor: "pointer" }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, background: "#FDECEC", color: "#8F2828", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico name="file-text" size={13} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#121619", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "#878D96" }}>{f.size}</div>
                </div>
                <Ico name="download" size={13} color="#697077" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.MessagesScreen = MessagesScreen;
