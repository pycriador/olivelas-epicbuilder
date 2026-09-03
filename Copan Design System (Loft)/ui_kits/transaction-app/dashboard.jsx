// dashboard.jsx — visão geral da transação

const { useState: useStD } = React;

function DashboardScreen({ goto }) {
  const steps = [
    { title: "Proposta enviada", desc: "Você fez uma proposta de R$ 1.245.000", meta: "14 abr · 09:32" },
    { title: "Proposta aceita", desc: "O vendedor aceitou os termos da proposta", meta: "15 abr · 14:08" },
    { title: "Análise de documentos", desc: "Estamos validando seus documentos pessoais e de renda", meta: "Em andamento" },
    { title: "Vistoria técnica", desc: "Visita do engenheiro para laudo do imóvel", meta: "Aguardando" },
    { title: "Análise jurídica", desc: "Verificação de matrícula e ônus do imóvel", meta: "Aguardando" },
    { title: "Assinatura digital", desc: "Contrato de compra e venda no Gov.br", meta: "Aguardando" },
    { title: "Registro em cartório", desc: "Loft envia ao cartório e acompanha o registro", meta: "Aguardando" },
  ];

  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard label="Etapa atual" value="3 de 7" hint="Análise de documentos" icon="git-merge" accent="orange" />
        <StatCard label="Valor da proposta" value="R$ 1.245.000" delta="+2,1%" hint="vs. avaliação" icon="banknote" accent="green" />
        <StatCard label="Documentos pendentes" value="2" hint="prazo até 22 abr" icon="file-text" accent="blue" />
        <StatCard label="Previsão de fechamento" value="22 dias" hint="estimativa Loft" icon="calendar-clock" accent="purple" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        {/* Linha do tempo */}
        <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#121619" }}>Linha do tempo da transação</div>
              <div style={{ fontSize: 13, color: "#697077", marginTop: 2 }}>Pinheiros · 62m² · 2 quartos · 1 vaga</div>
            </div>
            <StatusPill tone="attention">Documentos</StatusPill>
          </div>
          <Stepper steps={steps} current={2} />
        </div>

        {/* Próximas ações */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#FFF7F2", border: "1px solid #FFD9C7", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Ico name="alert-circle" size={18} color="#D94616" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#8A2606" }}>Ação necessária</span>
            </div>
            <div style={{ fontSize: 14, color: "#121619", lineHeight: "22px", marginBottom: 14 }}>
              Você tem <strong>2 documentos pendentes</strong>. Envie até <strong>22 abr</strong> para não atrasar a análise.
            </div>
            <button onClick={() => goto("documents")} style={{ background: "#F56738", color: "#FFF", border: "none", height: 40, padding: "0 16px", borderRadius: 8, fontFamily: "Inter", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
              Enviar documentos <Ico name="arrow-right" size={14} />
            </button>
          </div>

          <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#121619", marginBottom: 12 }}>Próximas atividades</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { dot: "#E5A300", title: "Vistoria técnica", date: "23 abr · 10h", who: "Eng. Paulo R." },
                { dot: "#4B94C5", title: "Análise jurídica", date: "26 abr", who: "Time Loft" },
                { dot: "#387BA8", title: "Reunião com Carla", date: "29 abr · 15h", who: "Videochamada" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: a.dot, marginTop: 6, flexShrink: 0 }}></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#121619" }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: "#697077", marginTop: 2 }}>{a.date} · {a.who}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resumo financeiro */}
      <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 12, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#121619" }}>Resumo financeiro</div>
          <button style={{ background: "transparent", border: "none", color: "#387BA8", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
            Ver detalhes <Ico name="arrow-up-right" size={12} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop: "1px solid #E1E9EF", borderBottom: "1px solid #E1E9EF" }}>
          {[
            { lbl: "Valor da compra", val: "R$ 1.245.000", note: "" },
            { lbl: "Entrada (20%)", val: "R$ 249.000", note: "Já comprovada" },
            { lbl: "Financiamento", val: "R$ 996.000", note: "Caixa · 360m" },
            { lbl: "Custos de transação", val: "R$ 38.420", note: "ITBI + cartório" },
          ].map((r, i) => (
            <div key={i} style={{ padding: "18px 20px", borderRight: i < 3 ? "1px solid #E1E9EF" : "none" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#697077", marginBottom: 6 }}>{r.lbl}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#121619", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>{r.val}</div>
              {r.note && <div style={{ fontSize: 11, color: "#878D96", marginTop: 4 }}>{r.note}</div>}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, padding: "16px 20px 0" }}>
          <span style={{ fontSize: 13, color: "#697077" }}>Total estimado da operação</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#D94616", fontVariantNumeric: "tabular-nums" }}>R$ 1.283.420</span>
        </div>
      </div>
    </div>
  );
}

window.DashboardScreen = DashboardScreen;
