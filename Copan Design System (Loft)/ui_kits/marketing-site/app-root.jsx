// app-root.jsx — orchestrator

const { useState: useStApp, useEffect: useEfApp } = React;

function App() {
  const [state, setState] = useStApp(() => {
    try {
      const saved = localStorage.getItem("copan_uikit_state");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { route: "home", property: null };
  });

  useEfApp(() => {
    localStorage.setItem("copan_uikit_state", JSON.stringify(state));
    // re-render Lucide icons whenever screen changes
    if (window.lucide) setTimeout(() => window.lucide.createIcons(), 50);
  }, [state]);

  const goto = (route, property = null) => setState({ route, property });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FFFFFF" }}>
      <Header route={state.route} goto={goto} />
      <main style={{ flex: 1 }}>
        {state.route === "home" && <HomeScreen goto={goto} />}
        {state.route === "search" && <SearchScreen goto={goto} />}
        {state.route === "detail" && <DetailScreen goto={goto} property={state.property} />}
      </main>
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
