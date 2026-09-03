# AI Portal — Loft

Portal interno de IA, 100% frontend com dados mockados locais. Sem banco, sem autenticação, sem APIs externas.

## Identidade visual

Paleta fornecida, aplicada como tokens semânticos:

- `#ff774a` primário / `#d94616` primário escuro (hover, ênfase)
- `#115644` verde profundo (superfícies escuras, sidebar, gráficos)
- `#25302c` texto/foreground escuro
- `#cee79e` verde claro (badges de impacto, destaques)
- `#ebebeb` bordas e superfícies neutras

Estética premium tipo Linear/Notion/Vercel: fundo claro quase branco, muito espaço em branco, tipografia forte (display + sans), cards com borda fina e sombra suave, radius moderado, microinterações discretas (hover lift, fade-in, transições 150–250ms). Sem cyberpunk, sem gradientes exagerados.

## Layout global

- Sidebar recolhível (desktop) / menu compacto em drawer (mobile) com: Home, O que já temos, AI Academy, Ferramentas, Templates & Prompts, Tenho uma ideia, AI Map, Impacto, AI Assistant.
- Topbar: busca global, botão AI Assistant, avatar mockado, atalho ⌘K/Ctrl+K.
- Command Palette global buscando em todos os conteúdos, com ações rápidas.
- Breadcrumbs nas páginas internas, toasts, skeleton loading, empty states.

## Páginas

1. **Home** — hero "AI @ Loft / Descubra. Aprenda. Construa com IA.", barra grande "Pergunte qualquer coisa sobre IA na Loft..." com perguntas de exemplo (envia para o AI Assistant), 4 atalhos, e seções: Em destaque, Continue explorando, Novidades, Cases mais acessados, Aprenda algo novo, Ferramentas populares, IA em números (48 soluções, 18.420h, 1.247 pessoas, 23 times).
2. **O que já temos** — grid de 12+ cases com thumbnail, nome, descrição, categoria, área, ferramentas, impacto, status, "Ver case". Filtros por categoria, área, ferramenta e impacto + busca local.
3. **Case detalhado** — cabeçalho com time, responsáveis, ferramentas, impacto, status; botões "Quero criar algo parecido", "Perguntar para IA", "Favoritar". Seções: Problema, Solução, Antes x Depois (comparação visual), Como funciona (fluxo Dados → Automação → IA → Processamento → Resultado), Passo a passo (accordions com texto, imagem, prompt, exemplo, dica), Resultados (métricas), Aprendizados, Conteúdos relacionados (aulas, templates, ferramentas, cases).
4. **AI Academy** — 5 trilhas (nível, nº de aulas, duração, progresso) e página de aula com player mockado, playlist, descrição, resumo, aprendizados, materiais e "Perguntar sobre esta aula". 15 aulas.
5. **Ferramentas** — 8 ferramentas (ChatGPT, n8n, Lovable, APIs de IA, internas fictícias) com detalhe: quando usar, quando não usar, exemplos, tutoriais, cases relacionados.
6. **Templates & Prompts** — abas. 10 templates (descrição, ferramentas, dificuldade, tempo, "Ver template" em modal) e 15 prompts (categoria, prompt, exemplo, "Copiar prompt" com feedback "Copiado ✓", favorito).
7. **Tenho uma ideia** — campo grande, fluxo simulado de perguntas (time, frequência, tempo, ferramentas) e geração do **AI Opportunity Canvas**: problema, solução sugerida, impacto potencial, complexidade, ferramentas, arquitetura simples, cases semelhantes, próximos passos.
8. **AI Assistant** — chat com mensagem inicial "Olá! 👋 O que você quer descobrir sobre IA na Loft?", sugestões, respostas simuladas montadas a partir do conteúdo mockado, cards de fontes clicáveis e sugestões de próximas perguntas.
9. **Busca global** — página de resultados com filtros e agrupamento por Cases, Aulas, Ferramentas, Templates, Prompts. Busca tolerante (tags, sinônimos, correspondência parcial).
10. **AI Map** — visual explorável com 6 áreas (Produto, Engenharia, Comercial, Operações, Marketing, Financeiro), contagem de projetos e drill-down nos cases da área.
11. **Impacto** — números consolidados, cases de maior impacto e gráficos simples (barras, linha, donut) com dados mockados.

## Conexão entre conteúdos

Cada entidade mockada referencia as outras por id (case ↔ aula ↔ template ↔ prompt ↔ ferramenta ↔ área). Toda página de detalhe termina com conteúdos relacionados + "Perguntar à IA" e "Criar algo parecido", sustentando o percurso problema → descoberta → aprendizado → próximo passo.

## Notas técnicas

- Rotas TanStack em `src/routes/`: `index`, `cases`, `cases.$id`, `academy`, `academy.$id`, `ferramentas`, `ferramentas.$id`, `biblioteca`, `ideia`, `assistente`, `mapa`, `impacto`, `busca`. Layout global no `__root.tsx` (sidebar + topbar + command palette). `head()` próprio por rota com título/descrição/OG em pt-BR.
- Dados mockados tipados em `src/data/` (cases, trilhas, aulas, ferramentas, templates, prompts, métricas, áreas), com helpers de busca e relacionamento em `src/lib/`.
- Estado local: favoritos, sidebar, filtros, chat e progresso via hooks React + localStorage. Nenhuma persistência remota.
- shadcn/ui (sidebar, dialog, tabs, accordion, sonner, skeleton, badge) + Recharts para gráficos; tokens de cor em `src/styles.css` em oklch.
- Thumbnails: imagens geradas para os principais cases/trilhas, com fallback ilustrativo em blocos de cor para os demais.

## Ordem de implementação

Layout global → Home → O que já temos → Case detalhado → AI Academy → Ferramentas → Templates & Prompts → Busca global → AI Assistant → Tenho uma ideia → AI Map → Impacto.
