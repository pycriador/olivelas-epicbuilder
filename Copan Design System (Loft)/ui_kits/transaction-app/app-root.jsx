// app-root.jsx — orchestrator do UI kit Transaction app

const { useState: useStR, useEffect: useEfR } = React;

function App() {
  const [route, setRoute] = useStR(() => {
    try { return localStorage.getItem("copan_tx_route") || "dashboard"; } catch (e) { return "dashboard"; }
  });

  useEfR(() => {
    try { localStorage.setItem("copan_tx_route", route); } catch (e) {}
    if (window.lucide) setTimeout(() => window.lucide.createIcons(), 60);
  }, [route]);

  const goto = (r) => setRoute(r);

  const titles = {
    dashboard: { t: "Sua transação", s: "Pinheiros · 62m² · Apto 142 · Proposta #2841", b: ["Início", "Transações", "Proposta #2841"] },
    proposal:  { t: "Proposta", s: "Detalhes financeiros e termos negociados", b: ["Início", "Transações", "Proposta #2841", "Detalhes"] },
    documents: { t: "Documentos", s: "Envio e validação dos documentos da transação", b: ["Início", "Transações", "Proposta #2841", "Documentos"] },
    messages:  { t: "Mensagens", s: "Converse com o time Loft que cuida da sua transação", b: ["Início", "Transações", "Proposta #2841", "Mensagens"] },
  };
  const cur = titles[route];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F2F4F8" }} data-screen-label={`tx-${route}`}>
      <Sidebar route={route} goto={goto} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar title={cur.t} subtitle={cur.s} breadcrumbs={cur.b} />
        <main style={{ flex: 1 }}>
          {route === "dashboard" && <DashboardScreen goto={goto} />}
          {route === "proposal"  && <ProposalScreen goto={goto} />}
          {route === "documents" && <DocumentsScreen goto={goto} />}
          {route === "messages"  && <MessagesScreen goto={goto} />}
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
