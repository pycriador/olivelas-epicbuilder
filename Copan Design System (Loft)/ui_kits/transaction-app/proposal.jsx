// proposal.jsx — Detalhes da proposta + simulação

const { useState: useStP } = React;

function ProposalScreen({ goto }) {
  const [tab, setTab] = useStP("overview");

  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero da proposta */}
      <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 12, overflow: "hidden", display: "grid", gridTemplateColumns: "320px 1fr" }}>
        <div style={{
          background: "linear-gradient(135deg, #FFE5D6 0%, #FFD9C7 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#D94616", position: "relative",
        }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <path d="M9 22V12h6v10" />
          </svg>
          <div style={{ position: "absolute", top: 14, left: 14, background: "#121619", color: "#E4B266", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Ico name="sparkles" size={11} /> Loft premium
          </div>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#697077", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>Proposta #2841 · Pinheiros</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#121619", lineHeight: "28px" }}>Rua Cardeal Arcoverde, 1200 — Apto 142</div>
              <div style={{ fontSize: 13, color: "#697077", marginTop: 4 }}>62m² · 2 quartos · 1 suíte · 1 vaga · Reformado pela Loft em 2024</div>
            </div>
            <StatusPill tone="attention">Aguardando documentos</StatusPill>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop: "1px solid #E1E9EF", paddingTop: 14 }}>
            <div><div style={{ fontSize: 11, color: "#697077", marginBottom: 2 }}>Valor proposto</div><div style={{ fontSize: 18, fontWeight: 700, color: "#121619" }}>R$ 1.245.000</div></div>
            <div><div style={{ fontSize: 11, color: "#697077", marginBottom: 2 }}>Avaliação Loft</div><div style={{ fontSize: 18, fontWeight: 700, color: "#121619" }}>R$ 1.219.000 <span style={{ fontSize: 12, color: "#115644", fontWeight: 600 }}>+2,1%</span></div></div>
            <div><div style={{ fontSize: 11, color: "#697077", marginBottom: 2 }}>Reservada em</div><div style={{ fontSize: 18, fontWeight: 700, color: "#121619" }}>14 abr 2026</div></div>
            <div><div style={{ fontSize: 11, color: "#697077", marginBottom: 2 }}>Validade</div><div style={{ fontSize: 18, fontWeight: 700, color: "#D94616" }}>22 abr 2026</div></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #E1E9EF" }}>
        {[
          { k: "overview", l: "Visão geral" },
          { k: "financing", l: "Financiamento" },
          { k: "people", l: "Compradores e vendedores" },
          { k: "history", l: "Histórico" },
        ].map(t => {
          const active = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              padding: "12px 18px", border: "none", background: "none", cursor: "pointer",
              fontFamily: "Inter", fontSize: 14, fontWeight: active ? 600 : 500,
              color: active ? "#121619" : "#697077",
              borderBottom: active ? "3px solid #F56738" : "3px solid transparent",
              marginBottom: -1,
            }}>{t.l}</button>
          );
        })}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "financing" && <FinancingTab />}
      {tab === "people" && <PeopleTab />}
      {tab === "history" && <HistoryTab />}
    </div>
  );
}

function OverviewTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#121619", marginBottom: 14 }}>Termos da proposta</div>
        <Row k="Valor da proposta" v="R$ 1.245.000" />
        <Row k="Forma de pagamento" v="Entrada + financiamento" />
        <Row k="Entrada" v="R$ 249.000 (20%)" />
        <Row k="Sinal" v="R$ 12.450 (1%)" sub="Pago em 14 abr · transferência" />
        <Row k="Prazo de fechamento" v="Até 60 dias" />
        <Row k="Inclusos" v="Móveis planejados de cozinha e quartos" />
        <Row k="Vistoria" v="Solicitada · 23 abr · 10h" last />
      </div>

      <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#121619", marginBottom: 14 }}>Custos de transação</div>
        <Row k="ITBI (3% do imóvel)" v="R$ 37.350" />
        <Row k="Cartório · escritura" v="R$ 4.870" />
        <Row k="Cartório · registro" v="R$ 6.180" />
        <Row k="Avaliação do banco" v="R$ 3.500" sub="Caixa Econômica" />
        <Row k="Taxa Loft" v="Isenta" sub="Reforma incluída" highlight />
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 0", borderTop: "2px solid #121619", marginTop: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#121619" }}>Total estimado</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#D94616", fontVariantNumeric: "tabular-nums" }}>R$ 51.900</span>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, sub, highlight, last }) {
  return (
    <div style={{ padding: "12px 0", borderBottom: last ? "none" : "1px solid #F2F4F8", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
      <span style={{ fontSize: 13, color: "#697077" }}>{k}</span>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: highlight ? "#115644" : "#121619" }}>{v}</div>
        {sub && <div style={{ fontSize: 11, color: "#878D96", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function FinancingTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#121619", marginBottom: 14 }}>Simulação Caixa</div>
        <div style={{ background: "#F2F4F8", borderRadius: 8, padding: 16, marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: "#697077", marginBottom: 4 }}>Parcela mensal estimada</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#121619", lineHeight: "36px", letterSpacing: "-0.01em" }}>R$ 7.412</div>
          <div style={{ fontSize: 12, color: "#697077", marginTop: 4 }}>SAC · 360 meses · Taxa 9,99% a.a. + TR</div>
        </div>
        <Row k="Valor financiado" v="R$ 996.000" />
        <Row k="Taxa de juros" v="9,99% a.a." sub="+ TR" />
        <Row k="Sistema de amortização" v="SAC" />
        <Row k="Prazo" v="360 meses" />
        <Row k="Comprometimento de renda" v="22%" sub="Limite Caixa: 30%" highlight last />
      </div>

      <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 12, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#121619" }}>Comparar bancos</div>
          <button style={{ background: "transparent", border: "none", color: "#387BA8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Adicionar banco +</button>
        </div>
        {[
          { bank: "Caixa", rate: "9,99%", parcel: "R$ 7.412", best: true },
          { bank: "Itaú", rate: "10,49%", parcel: "R$ 7.728", best: false },
          { bank: "Bradesco", rate: "10,89%", parcel: "R$ 7.984", best: false },
          { bank: "Santander", rate: "11,29%", parcel: "R$ 8.245", best: false },
        ].map((b, i) => (
          <div key={i} style={{ padding: "12px 14px", marginBottom: 8, border: b.best ? "2px solid #20A483" : "1px solid #E1E9EF", borderRadius: 8, display: "flex", alignItems: "center", gap: 14, background: b.best ? "#DEF5E5" : "#FFF" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#FFF", border: "1px solid #E1E9EF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#121619" }}>{b.bank.substring(0, 2).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#121619", display: "flex", alignItems: "center", gap: 6 }}>
                {b.bank}
                {b.best && <span style={{ background: "#115644", color: "#FFF", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.04em" }}>MELHOR OPÇÃO</span>}
              </div>
              <div style={{ fontSize: 12, color: "#697077" }}>Taxa {b.rate} a.a. · 360m</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#697077" }}>parcela</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#121619", fontVariantNumeric: "tabular-nums" }}>{b.parcel}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PeopleTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <PeopleCard
        title="Comprador"
        people={[{ name: "Mariana Castro de Oliveira", role: "Titular · Engenheira de software", doc: "CPF 123.456.789-00", initials: "MC", color: "#387BA8" }]}
      />
      <PeopleCard
        title="Vendedor"
        people={[{ name: "Loft Holding S.A.", role: "Vendedor · CNPJ 27.058.181/0001-70", doc: "Contato: Vendas · vendas@loft.com.br", initials: "LF", color: "#121619", company: true }]}
      />
      <PeopleCard
        title="Time Loft acompanhando você"
        people={[
          { name: "Carla Tavares", role: "Especialista de transação", doc: "carla.t@loft.com.br · (11) 9 9282-1142", initials: "CT", color: "#115644" },
          { name: "Rafael Andrade", role: "Análise jurídica", doc: "Disponível 9h–18h", initials: "RA", color: "#1F4E73" },
        ]}
      />
      <PeopleCard
        title="Banco"
        people={[{ name: "Caixa Econômica Federal", role: "Banco financiador · agência 0285", doc: "Gerente: João Mauro · (11) 3030-1102", initials: "CX", color: "#225C8A", company: true }]}
      />
    </div>
  );
}

function PeopleCard({ title, people }) {
  return (
    <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 12, padding: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#697077", marginBottom: 16 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {people.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{
              width: 44, height: 44, borderRadius: p.company ? 8 : 999,
              background: p.color, color: "#FFF",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, flexShrink: 0,
            }}>{p.initials}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#121619" }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#697077", marginTop: 2 }}>{p.role}</div>
              <div style={{ fontSize: 12, color: "#878D96", marginTop: 4, fontFamily: "Monaco, monospace" }}>{p.doc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTab() {
  const events = [
    { who: "Sistema Loft", what: "Documentos pendentes notificados", when: "16 abr · 18:42", icon: "bell", color: "#7A5200", bg: "#FFF4DF" },
    { who: "Mariana Castro", what: "Enviou extrato bancário (3.8 MB)", when: "16 abr · 18:42", icon: "upload-cloud", color: "#1F4E73", bg: "#EAF3F9" },
    { who: "Carla Tavares", what: "Validou documentos pessoais e renda parcial", when: "15 abr · 16:20", icon: "check-circle-2", color: "#115644", bg: "#DEF5E5" },
    { who: "Loft Holding S.A.", what: "Aceitou a proposta no valor de R$ 1.245.000", when: "15 abr · 14:08", icon: "handshake", color: "#D94616", bg: "#FFE5D6" },
    { who: "Mariana Castro", what: "Enviou proposta inicial · Pagamento sinal R$ 12.450", when: "14 abr · 09:32", icon: "file-signature", color: "#1F4E73", bg: "#EAF3F9" },
  ];
  return (
    <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 12, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#121619" }}>Histórico de eventos</div>
        <button style={{ background: "transparent", border: "1px solid #C1C7CD", color: "#121619", height: 32, padding: "0 12px", borderRadius: 6, fontFamily: "Inter", fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Ico name="download" size={12} /> Exportar PDF
        </button>
      </div>

      {events.map((e, i) => (
        <div key={i} style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: i === events.length - 1 ? "none" : "1px solid #F2F4F8", alignItems: "flex-start" }}>
          <span style={{ width: 40, height: 40, borderRadius: 8, background: e.bg, color: e.color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Ico name={e.icon} size={16} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: "#121619" }}><strong>{e.who}</strong> {e.what}</div>
            <div style={{ fontSize: 12, color: "#697077", marginTop: 2 }}>{e.when}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

window.ProposalScreen = ProposalScreen;
