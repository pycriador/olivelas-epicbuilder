// documents.jsx — Lista de documentos da transação

const { useState: useStDoc } = React;

function DocumentsScreen({ goto }) {
  const [filter, setFilter] = useStDoc("all");

  const docs = [
    { id: 1, name: "RG · Comprador", size: "1.2 MB", who: "Mariana Castro", date: "14 abr · 09:34", status: "approved", category: "pessoal", uploadPct: 100 },
    { id: 2, name: "CPF · Comprador", size: "0.8 MB", who: "Mariana Castro", date: "14 abr · 09:34", status: "approved", category: "pessoal", uploadPct: 100 },
    { id: 3, name: "Comprovante de residência", size: "2.4 MB", who: "Mariana Castro", date: "14 abr · 09:35", status: "approved", category: "pessoal", uploadPct: 100 },
    { id: 4, name: "Holerite · março/2026", size: "0.6 MB", who: "Mariana Castro", date: "14 abr · 09:36", status: "review", category: "renda", uploadPct: 100 },
    { id: 5, name: "Holerite · fevereiro/2026", size: "—", who: "—", date: "—", status: "missing", category: "renda" },
    { id: 6, name: "Imposto de renda · 2025", size: "—", who: "—", date: "—", status: "missing", category: "renda" },
    { id: 7, name: "Extrato bancário · últimos 90 dias", size: "3.8 MB", who: "Mariana Castro", date: "16 abr · 18:42", status: "uploading", category: "renda", uploadPct: 64 },
    { id: 8, name: "Matrícula atualizada", size: "1.1 MB", who: "Loft (vendedor)", date: "13 abr · 11:02", status: "approved", category: "imovel", uploadPct: 100 },
    { id: 9, name: "Certidão negativa de débitos · IPTU", size: "0.9 MB", who: "Loft (vendedor)", date: "13 abr · 11:04", status: "approved", category: "imovel", uploadPct: 100 },
    { id: 10, name: "Habite-se", size: "—", who: "—", date: "—", status: "rejected", category: "imovel", reason: "Documento ilegível. Reenviar em PDF colorido." },
  ];

  const filtered = filter === "all" ? docs : docs.filter(d => d.status === filter || d.category === filter);
  const counts = {
    all: docs.length,
    missing: docs.filter(d => d.status === "missing" || d.status === "rejected").length,
    review: docs.filter(d => d.status === "review" || d.status === "uploading").length,
    approved: docs.filter(d => d.status === "approved").length,
  };

  const sectionFor = (cat) => ({ pessoal: "Documentos pessoais", renda: "Comprovação de renda", imovel: "Documentos do imóvel" }[cat]);

  const grouped = filtered.reduce((acc, d) => { (acc[d.category] = acc[d.category] || []).push(d); return acc; }, {});

  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Banner alerta */}
      <div style={{ background: "#FFF7F2", border: "1px solid #FFD9C7", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 40, height: 40, borderRadius: 999, background: "#FFD9C7", color: "#D94616", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Ico name="alert-triangle" size={18} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#121619" }}>3 documentos precisam da sua atenção</div>
          <div style={{ fontSize: 13, color: "#697077", marginTop: 2 }}>2 estão pendentes de envio e 1 foi recusado. Prazo final: <strong style={{ color: "#121619" }}>22 abr 2026</strong>.</div>
        </div>
        <button style={{ background: "#FFF", color: "#121619", border: "1px solid #121619", height: 40, padding: "0 16px", borderRadius: 8, fontFamily: "Inter", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Falar com Carla
        </button>
        <button style={{ background: "#F56738", color: "#FFF", border: "none", height: 40, padding: "0 16px", borderRadius: 8, fontFamily: "Inter", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Ico name="upload" size={14} /> Enviar agora
        </button>
      </div>

      {/* Tabs filtro */}
      <div style={{ display: "flex", borderBottom: "1px solid #E1E9EF", gap: 0 }}>
        {[
          { k: "all", l: "Todos", c: counts.all },
          { k: "missing", l: "Pendentes", c: counts.missing },
          { k: "review", l: "Em análise", c: counts.review },
          { k: "approved", l: "Aprovados", c: counts.approved },
        ].map(t => {
          const active = filter === t.k;
          return (
            <button key={t.k} onClick={() => setFilter(t.k)} style={{
              padding: "12px 18px", border: "none", background: "none", cursor: "pointer",
              fontFamily: "Inter", fontSize: 14, fontWeight: active ? 600 : 500,
              color: active ? "#121619" : "#697077",
              borderBottom: active ? "3px solid #F56738" : "3px solid transparent",
              marginBottom: -1, display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              {t.l}
              <span style={{ background: active ? "#FFD9C7" : "#E1E9EF", color: active ? "#8B2D0B" : "#121619", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>{t.c}</span>
            </button>
          );
        })}
      </div>

      {/* Sections */}
      {["pessoal", "renda", "imovel"].map(cat => grouped[cat] && (
        <section key={cat}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#697077", marginBottom: 10 }}>{sectionFor(cat)}</div>
          <div style={{ background: "#FFF", border: "1px solid #E1E9EF", borderRadius: 12, overflow: "hidden" }}>
            {grouped[cat].map((d, i) => <DocRow key={d.id} d={d} last={i === grouped[cat].length - 1} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function DocRow({ d, last }) {
  const ICONS = {
    approved:  { ic: "check-circle-2", color: "#20A483", bg: "#DEF5E5" },
    review:    { ic: "clock", color: "#1F4E73", bg: "#EAF3F9" },
    uploading: { ic: "loader-2", color: "#4B94C5", bg: "#EAF3F9" },
    missing:   { ic: "circle-dashed", color: "#878D96", bg: "#F2F4F8" },
    rejected:  { ic: "x-circle", color: "#CE4242", bg: "#FDECEC" },
  };
  const meta = ICONS[d.status];
  const labels = { approved: "Aprovado", review: "Em análise", uploading: "Enviando…", missing: "Pendente", rejected: "Recusado" };

  return (
    <div style={{ padding: "16px 20px", borderBottom: last ? "none" : "1px solid #F2F4F8", display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ width: 40, height: 40, borderRadius: 8, background: meta.bg, color: meta.color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Ico name={d.status === "uploading" ? "loader-2" : "file-text"} size={18} style={d.status === "uploading" ? { animation: "spin 1s linear infinite" } : {}} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#121619" }}>{d.name}</div>
        <div style={{ fontSize: 12, color: "#697077", marginTop: 2, display: "flex", gap: 10 }}>
          {d.size !== "—" && <><span>{d.size}</span><span style={{ color: "#C1C7CD" }}>·</span></>}
          <span>{d.who}</span>
          {d.date !== "—" && <><span style={{ color: "#C1C7CD" }}>·</span><span>{d.date}</span></>}
        </div>
        {d.status === "uploading" && (
          <div style={{ marginTop: 8, height: 4, background: "#E1E9EF", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${d.uploadPct}%`, height: "100%", background: "#F56738", borderRadius: 999 }}></div>
          </div>
        )}
        {d.status === "rejected" && d.reason && (
          <div style={{ marginTop: 6, padding: "6px 10px", background: "#FDECEC", borderRadius: 6, fontSize: 12, color: "#8F2828", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Ico name="info" size={12} /> {d.reason}
          </div>
        )}
      </div>

      <StatusPill tone={d.status === "approved" ? "positive" : d.status === "review" ? "pending" : d.status === "uploading" ? "info" : d.status === "rejected" ? "negative" : "neutral"}>
        {labels[d.status]}
      </StatusPill>

      <div style={{ display: "flex", gap: 4 }}>
        {(d.status === "missing" || d.status === "rejected") ? (
          <button style={{ background: "#F56738", color: "#FFF", border: "none", height: 32, padding: "0 14px", borderRadius: 6, fontFamily: "Inter", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Ico name="upload" size={12} /> Enviar
          </button>
        ) : (
          <>
            <button title="Ver" style={{ width: 32, height: 32, border: "1px solid #E1E9EF", background: "#FFF", borderRadius: 6, cursor: "pointer", color: "#697077", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Ico name="eye" size={14} />
            </button>
            <button title="Mais" style={{ width: 32, height: 32, border: "1px solid #E1E9EF", background: "#FFF", borderRadius: 6, cursor: "pointer", color: "#697077", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Ico name="more-horizontal" size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

window.DocumentsScreen = DocumentsScreen;
