import { createFileRoute } from "@tanstack/react-router";

import { ClassicHome } from "@/components/portal/ClassicHome";
import { PortalHome } from "@/components/portal/PortalHome";
import { useLayoutMode } from "@/layout/LayoutModeProvider";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Olivelas App Model — Olivelas | Descubra, aprenda e construa com IA" },
      {
        name: "description",
        content:
          "Tudo o que estamos criando, aprendendo e transformando com Inteligência Artificial em um só lugar.",
      },
      { property: "og:title", content: "Olivelas App Model — Olivelas" },
      {
        property: "og:description",
        content: "Cases, trilhas, ferramentas e templates de IA para todos os times.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const { isClassic, ready } = useLayoutMode();
  if (!ready) return null;
  return isClassic ? <ClassicHome /> : <PortalHome />;
}
