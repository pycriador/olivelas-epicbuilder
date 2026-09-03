import type { HubContent } from "./types";
import { LOFT_COLOR_OPTIONS, LOFT_PALETTE } from "./loft-colors";

/** @deprecated Prefer LOFT_PALETTE — kept for AI Hub imports. */
export const HUB_PALETTE = LOFT_PALETTE;
/** @deprecated Prefer LOFT_COLOR_OPTIONS — kept for AI Hub imports. */
export const HUB_COLOR_OPTIONS = LOFT_COLOR_OPTIONS;

/** Quick-filter chips on the AI Hub home. */
export const HUB_TAG_FILTERS = [
  "Todos",
  "IA",
  "Automação",
  "Agentes",
  "n8n",
  "Prompts",
  "APIs",
  "Dados",
  "Produtividade",
  "MCP",
  "Gemini",
  "Copilot",
  "Claude",
  "Cursor",
  "Conceitos",
] as const;

/**
 * Seed catalog for AI Hub.
 * Videos: only PT-BR from official company channels (Microsoft Reactor, Google Brasil,
 * Google Cloud LATAM, AWS Developers LATAM, Microsoft AI Skills).
 * News: adapted from full official articles with sources.
 */
export const hubContents: HubContent[] = [
  {
    id: "guia-comecar-ia-dia-a-dia",
    kind: "tutorial",
    titulo: "Guia completo: como começar a usar IA no seu dia a dia",
    descricao: "Fundamentos de IA generativa (AWS Developers LATAM) e um plano prático para aplicar no trabalho na Loft com Gemini, Copilot ou Claude.",
    cor: "#115644",
    tags: [
      "Guia",
      "IA",
      "Produtividade",
      "Gemini"
    ],
    dificuldade: "Iniciante",
    duracao: "35 min",
    destaque: true,
    videoUrl: "https://www.youtube.com/embed/4tqGA3-JXUc",
    capa: "https://i.ytimg.com/vi/4tqGA3-JXUc/hqdefault.jpg",
    blocks: [
      {
        type: "heading",
        title: "Introdução"
      },
      {
        type: "paragraph",
        text: "IA generativa deixou de ser curiosidade e virou ferramenta de trabalho. Em vez de começar por um projeto enorme, o caminho mais seguro é entender o que o modelo faz bem, escolher 2–3 tarefas repetitivas e medir se o tempo economizado vale a revisão humana."
      },
      {
        type: "paragraph",
        text: "Este guia combina o conteúdo oficial em português da AWS Developers LATAM (“O que é Generative AI?”) com práticas do Google (Prompting Essentials / TCREI) e da Microsoft (FluêncIA / uso responsável). O objetivo é você sair com vocabulário certo, um prompt reutilizável e um critério claro de quando confiar — ou não — na resposta."
      },
      {
        type: "heading",
        title: "O que é IA generativa (em linguagem de trabalho)"
      },
      {
        type: "paragraph",
        text: "Modelos generativos aprendem padrões em enormes volumes de texto, código e mídia e, a partir de um prompt, produzem conteúdo novo: rascunhos, resumos, classificação, tradução, ideias. Diferente de um relatório fixo de BI, a saída muda conforme o contexto que você dá — e por isso qualidade do prompt e revisão humana importam tanto quanto o modelo."
      },
      {
        type: "paragraph",
        text: "No dia a dia da Loft, isso se traduz em: resumir threads, extrair campos de texto livre, gerar primeira versão de docs e apoiar triagem. O que não se traduz bem: decidir crédito, jurídico ou atendimento sensível sem humano no loop."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
        caption: "IA generativa acelera rascunho e síntese — a decisão continua com a pessoa. Imagem: Unsplash."
      },
      {
        type: "heading",
        title: "Pré-requisitos"
      },
      {
        type: "list",
        items: [
          "Acesso a um assistente aprovado na Loft (Gemini, ChatGPT/OpenAI, Claude/Anthropic ou Copilot)",
          "Uma tarefa recorrente que você já faz toda semana",
          "Política de dados: não colar CPF, CNPJ, contrato ou dado de cliente em ferramenta sem aprovação"
        ]
      },
      {
        type: "heading",
        title: "Passo a passo"
      },
      {
        type: "paragraph",
        text: "1) Assista ao vídeo oficial da AWS Developers LATAM e anote a diferença entre IA preditiva e generativa."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
        caption: "Organize oportunidades em um quadro simples: tarefa → risco → ganho. Imagem: Unsplash."
      },
      {
        type: "paragraph",
        text: "2) Liste cinco tarefas da semana. Marque as que envolvem texto, classificação ou síntese."
      },
      {
        type: "paragraph",
        text: "3) Escolha uma com baixo custo de erro (ex.: rascunho de update interno)."
      },
      {
        type: "paragraph",
        text: "4) Escreva o prompt no padrão TCREI (Google): Task, Context, References, Evaluate, Iterate."
      },
      {
        type: "code",
        language: "markdown",
        title: "Prompt TCREI (exemplo Loft)",
        text: "Tarefa: Escreva um update de 5 bullets para o time de produto.\nContexto: Sprint focada em reduzir tempo de triagem de leads; meta −20%.\nReferências: Tom direto; público = PMs e comercial.\nEvaluate: Cada bullet com ação; sem inventar números.\nIterate: Se faltar impacto, peça versão com 1 risco e 1 próximo passo."
      },
      {
        type: "paragraph",
        text: "5) Revise a saída como se fosse de um estagiário. Corrija fatos e tom antes de publicar."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
        caption: "Combinar IA + revisão humana é o padrão que escala com segurança. Imagem: Unsplash."
      },
      {
        type: "tip",
        title: "Dica",
        text: "Comece por algo que você sabe revisar. Se a IA errar, o custo precisa ser baixo."
      },
      {
        type: "heading",
        title: "Resultado final"
      },
      {
        type: "paragraph",
        text: "Você terá um mapa pessoal de oportunidades, um prompt versionado e o hábito de avaliar risco antes de colar a resposta em um canal oficial. Próximos passos neste Hub: biblioteca de prompts, agentes Microsoft Reactor e Gemini Enterprise."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "AWS Developers LATAM — O que é Generative AI? (YouTube, português).\nGoogle — Prompting Essentials / framework TCREI.\nMicrosoft Reactor — Curso FluêncIA / História de IA.\nMicrosoft AI Skills — Uso responsável da IA."
      }
    ],
    relacionados: [
      "post-ia-rotina",
      "tutorial-prompts-equipe",
      "news-gemini-workspace"
    ]
  },
  {
    id: "tutorial-primeiro-agente",
    kind: "tutorial",
    titulo: "Como criar seu primeiro agente de IA",
    descricao: "Do conceito ao fluxo operacional com o Microsoft Reactor: o que são agentes Copilot, limites, ferramentas e caminho até produção.",
    cor: "#25302c",
    tags: [
      "Agentes",
      "Tutorial",
      "Copilot",
      "Microsoft"
    ],
    dificuldade: "Intermediário",
    duracao: "40 min",
    destaque: true,
    videoUrl: "https://www.youtube.com/embed/FgndV_6joy4",
    capa: "https://i.ytimg.com/vi/FgndV_6joy4/hqdefault.jpg",
    blocks: [
      {
        type: "heading",
        title: "Introdução"
      },
      {
        type: "paragraph",
        text: "Um chat responde. Um workflow executa passos fixos. Um agente planeja o próximo passo, pode usar ferramentas e só para quando atinge um objetivo — ou quando a política manda escalar para humano."
      },
      {
        type: "paragraph",
        text: "A sessão oficial do Microsoft Reactor “Copilot e Agentes de IA: O Que São e Como Funcionam” explica, em português, essa diferença no ecossistema Microsoft 365 / Copilot Studio. Os mesmos princípios valem se você prototipar com OpenAI Agents SDK, Claude + tools/MCP ou Gemini Enterprise: objetivo claro, ferramentas limitadas, guardrails e observabilidade."
      },
      {
        type: "heading",
        title: "O que vamos construir"
      },
      {
        type: "paragraph",
        text: "Um agente mínimo de suporte interno: recebe pergunta, consulta uma base aprovada, responde com citação e escala quando não tem confiança. Depois, você replica o padrão em Copilot Studio, n8n + LLM ou código."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=80",
        caption: "Agentes orquestram ferramentas; humanos definem limites. Imagem: Unsplash."
      },
      {
        type: "heading",
        title: "Pré-requisitos"
      },
      {
        type: "list",
        items: [
          "Noção básica de prompts",
          "Uma fonte de conhecimento (Confluence, Notion ou SharePoint) com dono",
          "Lista explícita do que o agente NÃO pode fazer",
          "Canal de testes (nunca produção no dia 1)"
        ]
      },
      {
        type: "heading",
        title: "Passo a passo"
      },
      {
        type: "paragraph",
        text: "1) Defina o objetivo em uma frase (“responder dúvidas de onboarding com citação”)."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
        caption: "Documente objetivo, ferramentas e guardrails antes de ligar o modelo. Imagem: Unsplash."
      },
      {
        type: "paragraph",
        text: "2) Liste 1–3 ferramentas (busca em docs, abrir ticket, escalonar)."
      },
      {
        type: "paragraph",
        text: "3) Escreva instruções de sistema com tom, formato e proibições."
      },
      {
        type: "code",
        language: "markdown",
        title: "Esqueleto de instruções",
        text: "Você é um agente de suporte interno da Loft.\nObjetivo: responder com base nos documentos disponíveis.\nRegras:\n- Cite a fonte\n- Se não souber, diga que não sabe\n- Nunca invente política\n- Escalone jurídico/financeiro para humano"
      },
      {
        type: "paragraph",
        text: "4) Teste com 5 perguntas reais do time e registre falhas."
      },
      {
        type: "paragraph",
        text: "5) Só então conecte a um canal amplo e monitore custo/qualidade (veja o tutorial de governança)."
      },
      {
        type: "tip",
        title: "Dica",
        text: "Menos ferramentas no início. Agentes com poucas ações falham de forma mais previsível."
      },
      {
        type: "heading",
        title: "Resultado final"
      },
      {
        type: "paragraph",
        text: "Um agente mínimo viável, com instruções versionadas e critério de escalonamento. Para ir além: sessão “Criando e Gerenciando Agentes: Do Zero à Produção” (Microsoft Reactor) e o anúncio do Gemini Enterprise (Google)."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Microsoft Reactor — Copilot e Agentes de IA: O Que São e Como Funcionam (YouTube, português).\nMicrosoft Reactor — Criando e Gerenciando Agentes: Do Zero à Produção.\nOpenAI — New tools for building agents / Agents SDK (documentação oficial).\nAnthropic — Model Context Protocol (MCP).\nGoogle Cloud — Gemini Enterprise (blog.google/intl/pt-br)."
      }
    ],
    relacionados: [
      "post-o-que-sao-agentes",
      "news-openai-agentes",
      "news-gemini-enterprise",
      "tutorial-avaliar-ia"
    ]
  },
  {
    id: "tutorial-n8n-zero",
    kind: "tutorial",
    titulo: "Criando uma automação com IA do zero",
    descricao: "Monte um fluxo com gatilho, transformação com IA e notificação — com a visão oficial de automações e agentes do Microsoft Reactor (e como encaixar n8n).",
    cor: "#d94616",
    tags: [
      "n8n",
      "Automação",
      "Agentes",
      "Tutorial"
    ],
    dificuldade: "Iniciante",
    duracao: "30 min",
    videoUrl: "https://www.youtube.com/embed/nMdSjpB1QIg",
    capa: "https://i.ytimg.com/vi/nMdSjpB1QIg/hqdefault.jpg",
    blocks: [
      {
        type: "heading",
        title: "Introdução"
      },
      {
        type: "paragraph",
        text: "Automação boa tem três peças: um gatilho previsível, transferência de dados entre sistemas e um plano B quando a IA erra. Ferramentas como n8n (open-source), Power Automate e agentes do Microsoft 365 Copilot resolvem o mesmo problema com interfaces diferentes."
      },
      {
        type: "paragraph",
        text: "A sessão “Agentes em ação: personalize e gerencie suas automações comerciais” (Microsoft Reactor, português) mostra como personalizar e operar automações com agentes no ecossistema Microsoft. Use-a como referência de produto e governação; no laboratório, você pode replicar o fluxo em n8n se essa for a stack aprovada na Loft."
      },
      {
        type: "heading",
        title: "O que vamos construir"
      },
      {
        type: "list",
        items: [
          "Gatilho (formulário, webhook ou agenda)",
          "Normalização do payload",
          "Chamada a um LLM para resumir ou classificar",
          "Notificação no Slack/Teams em canal de teste"
        ]
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=80",
        caption: "Fluxo visual: trigger → transformar → IA → notificar. Imagem: Unsplash."
      },
      {
        type: "heading",
        title: "Passo a passo"
      },
      {
        type: "paragraph",
        text: "1) Escolha a ferramenta (n8n self-hosted/cloud ou Power Automate) conforme política interna."
      },
      {
        type: "paragraph",
        text: "2) Crie o trigger e rode um payload de exemplo."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        caption: "Sempre preserve o payload bruto para auditoria. Imagem: Unsplash."
      },
      {
        type: "paragraph",
        text: "3) Normalize campos (Set/Compose) antes do modelo."
      },
      {
        type: "paragraph",
        text: "4) Chame o modelo com prompt curto e formato JSON estrito."
      },
      {
        type: "paragraph",
        text: "5) Envie ao canal de testes; só ative em produção após 3 execuções ok e dono nomeado."
      },
      {
        type: "tip",
        title: "Dica",
        text: "Logue entrada bruta e saída da IA. Debugar depois salva horas."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Microsoft Reactor — Agentes em ação: personalize e gerencie suas automações comerciais (YouTube, português).\nDocumentação n8n.io — workflows, credentials e templates.\nMicrosoft Learn — Power Automate / Copilot Studio (visão de automação empresarial)."
      }
    ],
    relacionados: [
      "post-7-tarefas-automatizar",
      "tutorial-slack-bot",
      "tutorial-primeiro-agente"
    ]
  },
  {
    id: "tutorial-rag-interno",
    kind: "tutorial",
    titulo: "Montando um RAG com documentos internos",
    descricao: "Como grounding com bases internas funciona na prática (AWS Bedrock / GenAI LATAM) e o checklist de citação + permissão para a Loft.",
    cor: "#25302c",
    tags: [
      "RAG",
      "Dados",
      "AWS",
      "Tutorial"
    ],
    dificuldade: "Intermediário",
    duracao: "35 min",
    videoUrl: "https://www.youtube.com/embed/55nzTrFfE2s",
    capa: "https://i.ytimg.com/vi/55nzTrFfE2s/hqdefault.jpg",
    blocks: [
      {
        type: "heading",
        title: "Introdução"
      },
      {
        type: "paragraph",
        text: "RAG (Retrieval-Augmented Generation) melhora respostas ao buscar trechos relevantes em uma base externa e injetá-los no prompt. Em vez de o modelo “lembrar” de política desatualizada, ele responde com o documento que você indexou — e pode citar a fonte."
      },
      {
        type: "paragraph",
        text: "A sessão oficial da AWS Developers LATAM sobre IA generativa e Amazon Bedrock (português) cobre como montar aplicações práticas com modelos e bases de conhecimento. Os mesmos passos valem em Vertex AI Search, Azure AI Search ou stack open-source."
      },
      {
        type: "heading",
        title: "Arquitetura mínima"
      },
      {
        type: "list",
        items: [
          "Fontes confiáveis e versionadas",
          "Chunking + embeddings + índice vetorial",
          "Filtro por permissão no retrieval",
          "Prompt que obriga citação e admite “não sei”"
        ]
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        caption: "Retrieval bom + geração disciplinada = menos alucinação. Imagem: Unsplash."
      },
      {
        type: "heading",
        title: "Passo a passo"
      },
      {
        type: "paragraph",
        text: "1) Escolha um domínio estreito (ex.: onboarding de engenharia)."
      },
      {
        type: "paragraph",
        text: "2) Exporte só docs aprovados; remova dados sensíveis."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
        caption: "ACL no retrieval é tão importante quanto o modelo. Imagem: Unsplash."
      },
      {
        type: "paragraph",
        text: "3) Defina chunking (400–800 tokens) e metadados (área, dono, data, ACL)."
      },
      {
        type: "paragraph",
        text: "4) Indexe e teste 20 perguntas reais: citação correta vs. inventada."
      },
      {
        type: "paragraph",
        text: "5) Só então exponha em chat/agente com log de retrieval."
      },
      {
        type: "tip",
        title: "Dica",
        text: "RAG ruim quase sempre é retrieval ruim. Meça relevância do contexto antes de trocar o LLM."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "AWS Developers LATAM — Inteligência Artificial Generativa na AWS | Amazon Bedrock (YouTube, português).\nAWS — What is RAG? (documentação oficial).\nGoogle Cloud — Vertex AI Search / grounding.\nIBM Research — Retrieval-Augmented Generation overview."
      }
    ],
    relacionados: [
      "news-rag-empresa",
      "post-mcp-explicado",
      "tutorial-avaliar-ia"
    ]
  },
  {
    id: "tutorial-prompts-equipe",
    kind: "tutorial",
    titulo: "Biblioteca de prompts para o time",
    descricao: "Como versionar prompts que funcionam de verdade, com práticas do GitHub Copilot e administração de prompts no Copilot (Microsoft Reactor).",
    cor: "#115644",
    tags: [
      "Prompts",
      "Produtividade",
      "Copilot",
      "Tutorial"
    ],
    dificuldade: "Iniciante",
    duracao: "25 min",
    videoUrl: "https://www.youtube.com/embed/OjafdmTGJL0",
    capa: "https://i.ytimg.com/vi/OjafdmTGJL0/hqdefault.jpg",
    blocks: [
      {
        type: "heading",
        title: "Introdução"
      },
      {
        type: "paragraph",
        text: "Prompt bom é ativo de time: contexto, formato, exemplos e critério de aceite. A sessão do Microsoft Reactor sobre GitHub Copilot para desenvolver apps (português) mostra engenharia de prompt no fluxo real de código — os mesmos princípios valem para prompts de produto, ops e marketing."
      },
      {
        type: "heading",
        title: "Estrutura da biblioteca"
      },
      {
        type: "list",
        items: [
          "Pasta por área (Produto, Ops, Engenharia…)",
          "Cada prompt com objetivo, contexto, formato, restrições e exemplo",
          "Dono + data de revisão",
          "Changelog curto"
        ]
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
        caption: "Trate prompts como código: PR, dono e teste. Imagem: Unsplash."
      },
      {
        type: "heading",
        title: "Passo a passo"
      },
      {
        type: "paragraph",
        text: "1) Escolha um caso de uso repetido (resumo Slack → update semanal)."
      },
      {
        type: "paragraph",
        text: "2) Escreva o template TCREI e rode 5 exemplos reais."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
        caption: "Exemplos few-shot estabilizam tom e formato. Imagem: Unsplash."
      },
      {
        type: "paragraph",
        text: "3) Peça revisão de um colega (como code review)."
      },
      {
        type: "paragraph",
        text: "4) Publique na biblioteca com dono e tag de área."
      },
      {
        type: "code",
        language: "markdown",
        title: "Template de prompt",
        text: "# Resumo de thread Slack → update semanal\nObjetivo: 5 bullets acionáveis.\nContexto: Canal do squad; audiência EM + PM.\nFormato: Markdown; verbo no infinitivo.\nRestrições: Não inventar decisões; marcar [precisa confirmar]."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Microsoft Reactor — Codifique de forma mais inteligente: GitHub Copilot (YouTube, português).\nMicrosoft Reactor — Administrando o Copilot: Licenças, Monitoramento e Prompts.\nGoogle — Prompting Essentials (TCREI).\nOpenAI / DeepLearning.AI — ChatGPT Prompt Engineering for Developers (referência conceitual)."
      }
    ],
    relacionados: [
      "post-prompts-melhores",
      "guia-comecar-ia-dia-a-dia"
    ]
  },
  {
    id: "tutorial-avaliar-ia",
    kind: "tutorial",
    titulo: "Como medir qualidade e governar respostas de IA",
    descricao: "Golden set, revisão humana e governança de agentes — com a sessão oficial do Microsoft Reactor sobre governança de agentes do Copilot.",
    cor: "#25302c",
    tags: [
      "IA",
      "Governança",
      "Agentes",
      "Tutorial"
    ],
    dificuldade: "Intermediário",
    duracao: "35 min",
    videoUrl: "https://www.youtube.com/embed/pQodC3y9inI",
    capa: "https://i.ytimg.com/vi/pQodC3y9inI/hqdefault.jpg",
    blocks: [
      {
        type: "heading",
        title: "Introdução"
      },
      {
        type: "paragraph",
        text: "Sem medição, automação vira caixa-preta. Governança não é burocracia: é saber quem pode publicar um agente, quais dados ele lê, como auditar falhas e quando desligar."
      },
      {
        type: "paragraph",
        text: "A sessão “Governança de Agentes do Copilot” (Microsoft Reactor, português) cobre controles práticos no ecossistema Microsoft. Combine com um golden set interno (≥20 casos anotados) antes de escalar qualquer fluxo na Loft."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
        caption: "Monitoramento e permissões fecham o ciclo build → evaluate → iterate. Imagem: Unsplash."
      },
      {
        type: "heading",
        title: "Passo a passo"
      },
      {
        type: "paragraph",
        text: "1) Defina rubrica do que é resposta boa (3–5 critérios)."
      },
      {
        type: "paragraph",
        text: "2) Monte golden set com casos reais."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        caption: "Registre falhas com prompt + contexto + saída. Imagem: Unsplash."
      },
      {
        type: "paragraph",
        text: "3) Rode o fluxo e classifique falhas por risco."
      },
      {
        type: "paragraph",
        text: "4) Aplique controles de maker/admin (quem publica, quem aprova)."
      },
      {
        type: "paragraph",
        text: "5) Monitore custo, latência e taxa de escalonamento humano."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Microsoft Reactor — Governança de Agentes do Copilot (YouTube, português).\nMicrosoft AI Skills — O uso responsável da IA.\nMicrosoft — princípios de IA responsável."
      }
    ],
    relacionados: [
      "tutorial-primeiro-agente",
      "post-dados-sensiveis",
      "news-regulacao-ia-brasil"
    ]
  },
  {
    id: "tutorial-slack-bot",
    kind: "tutorial",
    titulo: "Bot e agente no canal do time em 30 minutos",
    descricao: "Do conceito à operação: criar e gerenciar agentes do zero à produção (Microsoft Reactor) e adaptar o padrão a Slack, Teams ou Chat.",
    cor: "#ff774a",
    tags: [
      "Automação",
      "Agentes",
      "APIs",
      "Tutorial"
    ],
    dificuldade: "Intermediário",
    duracao: "30 min",
    videoUrl: "https://www.youtube.com/embed/CxK4NgTQdMc",
    capa: "https://i.ytimg.com/vi/CxK4NgTQdMc/hqdefault.jpg",
    blocks: [
      {
        type: "heading",
        title: "Introdução"
      },
      {
        type: "paragraph",
        text: "O melhor lugar para validar utilidade de um agente é o canal onde o time já trabalha. Slack, Microsoft Teams e Google Chat permitem menções, threads e limites de permissão — ideais para um MVP."
      },
      {
        type: "paragraph",
        text: "A sessão “Criando e Gerenciando Agentes: Do Zero à Produção” (Microsoft Reactor, português) cobre o caminho operacional. Independentemente da plataforma, o padrão é o mesmo: app com identidade, evento de menção, system prompt curto, allowlist de canais e logs sem PII."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1200&q=80",
        caption: "Comece em canal de teste com allowlist. Imagem: Unsplash."
      },
      {
        type: "heading",
        title: "Passo a passo"
      },
      {
        type: "paragraph",
        text: "1) Crie o app (Slack API, Teams app ou Chat API) com permissões mínimas."
      },
      {
        type: "paragraph",
        text: "2) Escute o evento de menção e responda em thread."
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
        caption: "Separe credenciais em secrets — nunca no repositório. Imagem: Unsplash."
      },
      {
        type: "paragraph",
        text: "3) Chame o LLM com system prompt e limite de tokens."
      },
      {
        type: "paragraph",
        text: "4) Bloqueie canais sensíveis; deduplique retries."
      },
      {
        type: "paragraph",
        text: "5) Meça utilidade por uma semana antes de expandir."
      },
      {
        type: "code",
        language: "python",
        title: "Esqueleto (Slack Bolt + OpenAI)",
        text: "from slack_bolt import App\nfrom openai import OpenAI\napp = App(token=BOT_TOKEN)\nclient = OpenAI()\n\n@app.event(\"app_mention\")\ndef handle_mention(event, say):\n    resp = client.chat.completions.create(\n        model=\"gpt-4o-mini\",\n        messages=[\n            {\"role\": \"system\", \"content\": \"PT-BR, curto, sem inventar política.\"},\n            {\"role\": \"user\", \"content\": event.get(\"text\", \"\")},\n        ],\n    )\n    say(resp.choices[0].message.content)"
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Microsoft Reactor — Criando e Gerenciando Agentes: Do Zero à Produção (YouTube, português).\nSlack Developers — Building AI Apps with Bolt (documentação oficial).\nOpenAI — API reference (Chat Completions / Responses)."
      }
    ],
    relacionados: [
      "tutorial-n8n-zero",
      "tutorial-primeiro-agente",
      "post-7-tarefas-automatizar"
    ]
  },
  {
    id: "post-ia-rotina",
    kind: "post",
    titulo: "IA na rotina: onde ela realmente economiza tempo",
    descricao: "Onde Gemini, Copilot e Claude geram ganho real — e onde só criam retrabalho, com base em guias oficiais de produtividade e uso responsável.",
    cor: "#ff774a",
    tags: [
      "Produtividade",
      "IA",
      "Gemini",
      "Copilot"
    ],
    destaque: true,
    duracao: "12 min",
    videoUrl: "https://www.youtube.com/embed/D_YgMgMmwh8",
    capa: "https://i.ytimg.com/vi/D_YgMgMmwh8/hqdefault.jpg",
    blocks: [
      {
        type: "heading",
        title: "Contexto"
      },
      {
        type: "paragraph",
        text: "A maior economia com IA generativa aparece quando o modelo rascunha e a pessoa decide. Cursos oficiais da Microsoft (FluêncIA / História de IA) e materiais do Google Workspace com Gemini mostram o mesmo padrão: reduzir carga de tarefas rotineiras — notas, síntese, primeira versão — sem transferir accountability."
      },
      {
        type: "paragraph",
        text: "Na Loft, trate cada uso como experimento com dono: qual tarefa, qual ferramenta aprovada, qual risco se a resposta estiver errada."
      },
      {
        type: "heading",
        title: "Onde costuma valer a pena"
      },
      {
        type: "list",
        items: [
          "Resumir threads longas e reuniões",
          "Extrair campos de texto livre para planilha/CRM",
          "Gerar primeira versão de PRD, FAQ ou update semanal",
          "Triagem inicial de pedidos internos (com fila humana depois)",
          "Apoio a código com GitHub Copilot (sempre revisando o diff)"
        ]
      },
      {
        type: "heading",
        title: "Onde gera retrabalho"
      },
      {
        type: "list",
        items: [
          "Decisões jurídicas, financeiras ou de cliente sem revisão",
          "Prompts vagos (“melhora isso”) sem formato nem critério",
          "Colar saída em e-mail externo sem checar fatos",
          "Usar dado sensível em ferramenta sem política clara"
        ]
      },
      {
        type: "callout",
        title: "Cuidado",
        text: "Se o erro for caro, a IA deve sugerir — não decidir sozinha. Isso vale para Gemini, ChatGPT, Claude ou Copilot."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Microsoft Reactor — Curso 1 Aula 1: A História de IA (YouTube, português).\nMicrosoft AI Skills — O uso responsável da IA.\nGoogle Workspace — blog oficial (IA no trabalho / Gemini no Workspace)."
      }
    ],
    relacionados: [
      "guia-comecar-ia-dia-a-dia",
      "post-prompts-melhores",
      "post-dados-sensiveis"
    ]
  },
  {
    id: "post-o-que-sao-agentes",
    kind: "post",
    titulo: "O que são agentes de IA?",
    descricao: "Chat vs. workflow vs. agente — com a explicação oficial do Microsoft Reactor e o recorte de Gemini Enterprise, OpenAI e Anthropic.",
    cor: "#25302c",
    tags: [
      "Agentes",
      "Conceitos",
      "Copilot",
      "Gemini"
    ],
    duracao: "10 min",
    videoUrl: "https://www.youtube.com/embed/FgndV_6joy4",
    capa: "https://i.ytimg.com/vi/FgndV_6joy4/hqdefault.jpg",
    blocks: [
      {
        type: "heading",
        title: "Definição prática"
      },
      {
        type: "paragraph",
        text: "Chat responde uma vez. Workflow executa passos fixos. Agente decide o próximo passo dentro de limites, pode chamar ferramentas e manter estado até um critério de parada."
      },
      {
        type: "paragraph",
        text: "No Microsoft Reactor (“Copilot e Agentes de IA”), isso aparece no Copilot Studio e no Microsoft 365: agentes com conhecimento, ações e políticas. No Google, o Gemini Enterprise posiciona agentes pré-criados e personalizados conectados a dados corporativos. Na OpenAI, o Agents SDK traz handoffs, guardrails e tracing. Na Anthropic, tools + MCP padronizam o acesso a sistemas."
      },
      {
        type: "heading",
        title: "Sinais de que você precisa de um agente"
      },
      {
        type: "list",
        items: [
          "O caminho depende do contexto",
          "Há ferramentas reais para consultar ou agir",
          "Você consegue definir quando parar e quando pedir humano"
        ]
      },
      {
        type: "paragraph",
        text: "Se o fluxo é sempre o mesmo, prefira automação clássica (n8n / Power Automate). Agente brilha na incerteza controlada."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Microsoft Reactor — Copilot e Agentes de IA: O Que São e Como Funcionam (YouTube, português).\nGoogle Cloud — Apresentamos o Gemini Enterprise (blog.google/intl/pt-br).\nOpenAI — New tools for building agents (openai.com).\nAnthropic — Introducing the Model Context Protocol."
      }
    ],
    relacionados: [
      "tutorial-primeiro-agente",
      "news-openai-agentes",
      "news-gemini-enterprise"
    ]
  },
  {
    id: "post-7-tarefas-automatizar",
    kind: "post",
    titulo: "7 tarefas que você provavelmente poderia automatizar",
    descricao: "Lista prática para produto, ops e engenharia — alinhada a padrões de automação com agentes e fluxos empresariais.",
    cor: "#d94616",
    tags: [
      "Automação",
      "Produtividade",
      "Agentes"
    ],
    duracao: "9 min",
    blocks: [
      {
        type: "paragraph",
        text: "Automação boa tem trigger previsível, transferência de dados e caminho humano quando falha. Estas sete tarefas aparecem com frequência em playbooks de Copilot Studio, Power Automate e n8n:"
      },
      {
        type: "list",
        items: [
          "Resumo semanal de métricas (Sheets/BI → Slack/Teams)",
          "Triagem de feedback de NPS / formulário",
          "Checagem de campos obrigatórios antes de abrir ticket",
          "Rascunho de resposta a pedidos internos recorrentes",
          "Alertas com contexto (não só “erro 500”)",
          "Organização de tickets por tema com classificação LLM",
          "Checklist de handoff entre times"
        ]
      },
      {
        type: "tip",
        title: "Comece pequeno",
        text: "Um fluxo com 3 nós e canal de teste bate um agente genérico sem dono."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Microsoft Reactor — Agentes em ação (automações comerciais).\nDocumentação n8n.io — templates de workflow.\nMicrosoft Learn — Power Automate."
      }
    ],
    relacionados: [
      "tutorial-n8n-zero",
      "post-ia-rotina"
    ]
  },
  {
    id: "post-prompts-melhores",
    kind: "post",
    titulo: "Como escrever prompts melhores",
    descricao: "Clareza, formato, exemplos e TCREI — o básico que muda o resultado em Gemini, ChatGPT, Claude e Copilot.",
    cor: "#115644",
    tags: [
      "Prompts",
      "IA",
      "Gemini"
    ],
    duracao: "8 min",
    videoUrl: "https://www.youtube.com/embed/6L5luanROpM",
    capa: "https://i.ytimg.com/vi/6L5luanROpM/hqdefault.jpg",
    blocks: [
      {
        type: "paragraph",
        text: "Bom prompt é brief: quem é o leitor, qual o formato, o que não pode faltar e um exemplo do bom resultado. O Google resume isso em TCREI; a Microsoft reforça engenharia de prompt no Copilot e no GitHub Copilot."
      },
      {
        type: "code",
        language: "markdown",
        title: "Estrutura útil",
        text: "Contexto: ...\nTarefa: ...\nFormato: ...\nRestrições: ...\nExemplo: ...\nEvaluate / Iterate: ..."
      },
      {
        type: "list",
        items: [
          "Peça formato explícito (JSON, tabela, 5 bullets)",
          "Dê 1–2 exemplos few-shot quando o tom importar",
          "Separe fatos de opinião na instrução",
          "Guarde o prompt vencedor na biblioteca do time"
        ]
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Microsoft Reactor — Administrando o Copilot: Licenças, Monitoramento e Prompts (YouTube, português).\nGoogle — Prompting Essentials (TCREI).\nOpenAI Cookbook — prompting guides."
      }
    ],
    relacionados: [
      "tutorial-prompts-equipe",
      "guia-comecar-ia-dia-a-dia"
    ]
  },
  {
    id: "post-mcp-explicado",
    kind: "post",
    titulo: "MCP explicado de forma simples",
    descricao: "O Model Context Protocol da Anthropic: por que conectores padronizados importam para Claude, agentes e ferramentas como Cursor.",
    cor: "#cee79e",
    tags: [
      "MCP",
      "Conceitos",
      "Claude",
      "Cursor",
      "APIs"
    ],
    duracao: "10 min",
    blocks: [
      {
        type: "heading",
        title: "O anúncio"
      },
      {
        type: "paragraph",
        text: "Em 25 de novembro de 2024, a Anthropic open-sourcou o Model Context Protocol (MCP): um padrão para conectar assistentes de IA a repositórios, ferramentas de negócio e ambientes de desenvolvimento — em vez de um conector customizado por sistema."
      },
      {
        type: "paragraph",
        text: "Na prática, um servidor MCP expõe resources, tools e prompts; o cliente (Claude Desktop, IDEs, agentes) consome essas capacidades. Ferramentas de desenvolvimento como o Cursor adotaram o ecossistema de MCP para conectar o editor a dados e ações externas de forma padronizada."
      },
      {
        type: "heading",
        title: "Por que importa na Loft"
      },
      {
        type: "list",
        items: [
          "Menos colagem frágil entre chat e sistemas internos",
          "Mais reuso de conectores entre times",
          "Fronteiras claras: o servidor controla o que o modelo pode ver/fazer"
        ]
      },
      {
        type: "paragraph",
        text: "MCP não substitui governança: você ainda define quais servidores instalar, quais secrets expor e o que auditar."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Anthropic — Introducing the Model Context Protocol (anthropic.com).\nmodelcontextprotocol.io — architecture e specification.\nCursor — documentação de MCP / agents (docs oficiais do produto).\nGoogle Cloud — menção a MCP e A2A no ecossistema de agentes (Gemini Enterprise)."
      }
    ],
    relacionados: [
      "post-o-que-sao-agentes",
      "post-cursor-ai-studio",
      "tutorial-primeiro-agente"
    ]
  },
  {
    id: "post-dados-sensiveis",
    kind: "post",
    titulo: "IA e dados sensíveis: o que pode ir no prompt",
    descricao: "Checklist alinhado a LGPD, uso responsável Microsoft e controles do Google Workspace — para não vazar dado de cliente.",
    cor: "#ebebeb",
    tags: [
      "Governança",
      "IA",
      "LGPD"
    ],
    duracao: "9 min",
    videoUrl: "https://www.youtube.com/embed/3gjorNpeFdY",
    capa: "https://i.ytimg.com/vi/3gjorNpeFdY/hqdefault.jpg",
    blocks: [
      {
        type: "paragraph",
        text: "Regra simples: se você não colocaria no Slack público, não coloque no prompt de uma ferramenta sem política clara. A Microsoft publica explicitamente princípios de IA responsável; o Google Workspace afirma que prompts/respostas do domínio não treinam modelos externos sem permissão — mas isso não autoriza colar PII indiscriminadamente."
      },
      {
        type: "list",
        items: [
          "Anonimizar ou agregar (sem CPF/CNPJ, e-mail pessoal, endereço)",
          "Usar apenas ambientes e fornecedores aprovados",
          "Preferir RAG interno a colar docs confidenciais em chat público",
          "Registrar finalidade quando o fluxo for recorrente"
        ]
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Microsoft AI Skills — O uso responsável da IA (YouTube, português).\nGoogle Workspace — O Google Workspace possibilita o futuro do trabalho com IA (privacidade e controles).\nSenado / Câmara — PL 2.338/2023 (marco legal da IA).\nLGPD — Lei nº 13.709/2018."
      }
    ],
    relacionados: [
      "news-regulacao-ia-brasil",
      "guia-comecar-ia-dia-a-dia"
    ]
  },
  {
    id: "post-ferramentas-ia-2026",
    kind: "post",
    titulo: "Mapa rápido de ferramentas de IA em 2026",
    descricao: "Assistentes, agentes, automação, RAG, Gemini Enterprise, AI Studio e Cursor — quando usar cada camada.",
    cor: "#115644",
    tags: [
      "IA",
      "Gemini",
      "OpenAI",
      "Claude",
      "Cursor",
      "Conceitos"
    ],
    duracao: "12 min",
    videoUrl: "https://www.youtube.com/embed/krt10usR1B8",
    capa: "https://i.ytimg.com/vi/krt10usR1B8/hqdefault.jpg",
    blocks: [
      {
        type: "paragraph",
        text: "O time não precisa de dez logins. Precisa de 2–3 ferramentas com dono e política. Em 2025–2026 o mercado consolidou camadas claras:"
      },
      {
        type: "list",
        items: [
          "Assistente: ChatGPT, Claude, Gemini app — rascunho e análise",
          "Produtividade embutida: Gemini no Workspace, Microsoft 365 Copilot",
          "Studio / API: Google AI Studio, Vertex AI, Azure OpenAI, Anthropic API",
          "Agentes: Copilot Studio, Gemini Enterprise, OpenAI Agents SDK",
          "Dev: Cursor, GitHub Copilot, Gemini CLI",
          "Automação: n8n, Power Automate",
          "RAG / knowledge: Bedrock Knowledge Bases, Vertex AI Search, Azure AI Search"
        ]
      },
      {
        type: "tip",
        title: "Regra Loft",
        text: "Escolha a camada mais simples que resolve. Agente com computer use não substitui um workflow bem feito."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Microsoft Reactor — Crie aplicativos de IA generativa com Azure (YouTube, português).\nGoogle Cloud — Gemini Enterprise / Google AI Studio (blog e docs).\nOpenAI — platform.openai.com.\nAnthropic — docs.anthropic.com.\nCursor — cursor.com/docs."
      }
    ],
    relacionados: [
      "post-mcp-explicado",
      "news-gemini-enterprise",
      "post-cursor-ai-studio"
    ]
  },
  {
    id: "post-cursor-ai-studio",
    kind: "post",
    titulo: "Cursor, Google AI Studio e o novo jeito de construir com IA",
    descricao: "Como IDEs agenticas e studios oficiais (Google AI Studio / Vertex) se encaixam no fluxo de engenharia — sem substituir revisão humana.",
    cor: "#25302c",
    tags: [
      "Cursor",
      "AI Studio",
      "Engenharia",
      "Agentes"
    ],
    duracao: "11 min",
    blocks: [
      {
        type: "heading",
        title: "O que mudou no fluxo de eng"
      },
      {
        type: "paragraph",
        text: "Ferramentas como o Cursor colocam o modelo dentro do editor: contexto do repositório, edits multiarquivo e agentes que executam tarefas com permissão. No lado Google, o AI Studio e a API Gemini (além do Vertex) são o caminho oficial para prototipar prompts, multimodalidade e apps. No lado Microsoft, GitHub Copilot Agent Mode e Azure AI cobrem o mesmo espaço."
      },
      {
        type: "paragraph",
        text: "Nenhuma dessas ferramentas remove a necessidade de testes, code review e secrets bem geridos. Elas aceleram o rascunho — você continua dono do merge."
      },
      {
        type: "heading",
        title: "Boas práticas na Loft"
      },
      {
        type: "list",
        items: [
          "Não cole secrets no chat do IDE",
          "Limite MCP servers ao mínimo necessário",
          "Exija testes para mudanças geradas por agente",
          "Documente prompts de sistema usados em CI/automação"
        ]
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Cursor — documentação oficial (Agents, MCP, Privacy).\nGoogle AI Studio — aistudio.google.com / documentação Gemini API.\nGoogle Cloud — Vertex AI e Gemini para desenvolvedores.\nGitHub — Copilot agent mode (docs Microsoft/GitHub)."
      }
    ],
    relacionados: [
      "post-ferramentas-ia-2026",
      "post-mcp-explicado",
      "tutorial-prompts-equipe"
    ]
  },
  {
    id: "news-gemini-enterprise",
    kind: "news",
    titulo: "Apresentamos o Gemini Enterprise",
    descricao: "Matéria completa do blog oficial do Google (pt-BR): a porta de entrada de IA no trabalho com agentes, dados corporativos e governança.",
    cor: "#115644",
    tags: [
      "Google",
      "Gemini",
      "Agentes",
      "AI News"
    ],
    fonte: "Google Cloud",
    capa: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80",
    whyItMatters: "Define o padrão de plataforma de agentes que a Loft deve observar ao avaliar Gemini Enterprise, conectores e governança central.",
    blocks: [
      {
        type: "paragraph",
        text: "Publicado em 9 de outubro de 2025 no blog oficial do Google (Thomas Kurian). Abaixo, a matéria adaptada ao formato do AI Hub, preservando o conteúdo publicado."
      },
      {
        type: "heading",
        title: "A oportunidade — e o problema dos silos"
      },
      {
        type: "paragraph",
        text: "A IA apresenta uma oportunidade única de transformar a forma como você trabalha, administra a empresa e cria para clientes. Mas a primeira onda de IA, embora promissora, ficou presa em silos, incapaz de orquestrar trabalhos complexos em toda a organização. A verdadeira transformação exige uma plataforma abrangente que se conecte ao seu contexto, fluxos de trabalho e pessoas. Por isso o Google apresentou o Gemini Enterprise: a nova porta de entrada para a IA no trabalho."
      },
      {
        type: "paragraph",
        text: "Segundo o anúncio, a vantagem começa com infraestrutura de IA criada para esse fim, pesquisa do Google DeepMind e a família de modelos Gemini. O Google Cloud afirma que nove dos dez principais laboratórios de IA e quase todos os unicórnios de IA já usam a nuvem Google, e que 65% dos clientes usam produtos de IA — com casos citados como Banco BV, Deloitte, Deutsche Telekom e outros."
      },
      {
        type: "heading",
        title: "IA que transforma sua forma de trabalhar"
      },
      {
        type: "paragraph",
        text: "O Gemini Enterprise leva o melhor da IA do Google a todos os funcionários com uma interface de chat intuitiva. Por trás dela, a plataforma unifica componentes principais: modelos Gemini avançados; bancada sem código para orquestrar agentes; força-tarefa de agentes pré-criados (pesquisas e insights); agentes personalizados das equipes ou parceiros; conexão segura a dados (Google Workspace, Microsoft 365, Salesforce, SAP); e governança central para visualizar, proteger e auditar agentes."
      },
      {
        type: "paragraph",
        text: "O anúncio destaca abertura e ecossistema de mais de 100 mil parceiros. Exemplos citados: gerentes do Banco BV com análises aceleradas; Harvey (IA jurídica) com Gemini; Macquarie Bank com redução de falsos positivos em fraudes e mais autoatendimento."
      },
      {
        type: "heading",
        title: "Workspace, voz e dados"
      },
      {
        type: "paragraph",
        text: "Com Google Workspace, o Google anunciou agentes multimodais: no Vids, transformar apresentações em vídeo com roteiro/narração; no Meet, tradução de voz em tempo real para clientes corporativos. Também anunciou Agente de ciência de dados (pré-lançamento) para automatizar ingestão/organização de dados, com clientes como Morrisons, Vodafone e Walmart."
      },
      {
        type: "heading",
        title: "Engajamento do cliente e o que você cria"
      },
      {
        type: "paragraph",
        text: "No Customer Engagement Suite, casos como Commerzbank (chatbot Bene com milhões de conversas) e Mercari (ROI projetado no call center) ilustram atendimento. Novos agentes de conversação (prévia) conectam-se ao Gemini Enterprise, com builder low-code, suporte a mais de 40 idiomas e governança unificada."
      },
      {
        type: "paragraph",
        text: "Para desenvolvedores, o Google cita a CLI do Gemini (mais de 1 milhão de desenvolvedores em três meses) e extensões para Atlassian, GitLab, MongoDB, Postman, Shopify, Stripe e outros. Menciona ainda os protocolos abertos Agent2Agent (A2A), MCP e Agent Payments Protocol (AP2) com parceiros de pagamento."
      },
      {
        type: "heading",
        title: "Capacitação"
      },
      {
        type: "paragraph",
        text: "O Google lançou o Google Skills (treinamento sem custo financeiro) e o programa Gemini Enterprise Agent Ready (GEAR), além da equipe Delta de engenheiros de IA para desafios complexos."
      },
      {
        type: "callout",
        title: "Por que isso importa na Loft?",
        text: "Gemini Enterprise embala o que avaliamos internamente: agentes com contexto corporativo, conectores, governança e caminho de capacitação. Use a matéria completa como referência ao comparar stacks."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Google Cloud — Apresentamos o Gemini Enterprise (blog.google/intl/pt-br/produtos/nas-nuvens/apresentamos-o-gemini-enterprise/), Thomas Kurian, 09/10/2025.\nGoogle Brasil — Gemini Spark (YouTube oficial, português) para visão de assistente pessoal agêntico."
      }
    ],
    relacionados: [
      "news-gemini-workspace",
      "post-o-que-sao-agentes",
      "post-ferramentas-ia-2026"
    ]
  },
  {
    id: "news-gemini-workspace",
    kind: "news",
    titulo: "O Google Workspace possibilita o futuro do trabalho com IA para todas as empresas",
    descricao: "Matéria completa do blog oficial do Google (pt-BR): Gemini incluído nos planos Business e Enterprise, sem complemento separado.",
    cor: "#115644",
    tags: [
      "Google",
      "Gemini",
      "Produtividade",
      "AI News"
    ],
    fonte: "Google Workspace",
    capa: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80",
    whyItMatters: "Baixa a barreira de adoção de IA no dia a dia — e reforça controles de privacidade que a Loft deve conhecer antes de liberar uso amplo.",
    blocks: [
      {
        type: "paragraph",
        text: "Matéria publicada no blog oficial do Google (Jerry Dischler), adaptada ao formato do AI Hub."
      },
      {
        type: "heading",
        title: "A decisão"
      },
      {
        type: "paragraph",
        text: "O Google afirma que a IA é fundamental para o futuro do trabalho e que seu poder transformador deve abranger todas as empresas e funcionários a um preço acessível. Por isso, incluiu o melhor da IA do Google nos planos Workspace Business e Enterprise, trazendo recursos de IA generativa sem a necessidade de comprar complemento."
      },
      {
        type: "paragraph",
        text: "O Workspace capacita mais de 10 milhões de empresas. No ano anterior ao anúncio, mais de 100 mil clientes adotaram IA generativa para produtividade, criatividade e inovação — reduzindo tarefas rotineiras e atuando como parceiro de pensamento."
      },
      {
        type: "heading",
        title: "Recursos que passam a fazer parte dos planos"
      },
      {
        type: "list",
        items: [
          "Assistência de IA no Gmail, Docs, Sheets, Meet, Chat, Vids e mais — resumir, rascunhar, encontrar informações e criar documentos/slides/planilhas/vídeos",
          "Gemini Advanced no aplicativo Gemini — projetos complexos, coding, pesquisa, análise de dados e Gems",
          "NotebookLM Plus — upload de fontes, insights, overviews de áudio e compartilhamento com o time"
        ]
      },
      {
        type: "heading",
        title: "Preços simplificados"
      },
      {
        type: "paragraph",
        text: "Ao eliminar o complemento, o Google simplificou preços. Exemplo citado: cliente Business Standard com complemento Gemini Business pagava US$ 32 por usuário/mês; com a mudança, US$ 14 por usuário/mês (US$ 2 a mais que o Workspace sem Gemini). Novos clientes: preço imediato; existentes: a partir de 17 de março de 2025 ou na renovação anual, o que ocorrer por último. Clientes empresariais muito pequenos não estavam sujeitos à mudança naquele momento."
      },
      {
        type: "heading",
        title: "Protegendo interações com IA"
      },
      {
        type: "list",
        items: [
          "Dados do cliente não são usados para treinar modelos Gemini fora do domínio sem permissão; não são vendidos nem usados para anúncios",
          "Controles empresariais: Gemini só recupera dados que o usuário pode acessar; soberania/segurança do Workspace se aplicam",
          "Certificações citadas: SOC 1/2/3, ISO 27001/17/18, ISO 42001; suporte a cenários HIPAA"
        ]
      },
      {
        type: "callout",
        title: "Por que isso importa na Loft?",
        text: "Se a empresa usa Workspace, a IA já está no caminho do usuário final. Combine com o post de dados sensíveis e com a política interna antes de liberar para todos."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Google Workspace — O Google Workspace possibilita o futuro do trabalho com IA para todas as empresas (blog.google/intl/pt-br).\nGoogle Workspace Help — Gemini AI features now included in Google Workspace subscriptions."
      }
    ],
    relacionados: [
      "news-gemini-enterprise",
      "guia-comecar-ia-dia-a-dia",
      "post-dados-sensiveis"
    ]
  },
  {
    id: "news-openai-agentes",
    kind: "news",
    titulo: "OpenAI lança Agents SDK e novas ferramentas para agentes",
    descricao: "Cobertura completa do anúncio oficial de 11 de março de 2025 (Responses API, Agents SDK, computer use e tracing), adaptada ao Hub.",
    cor: "#25302c",
    tags: [
      "OpenAI",
      "Agentes",
      "AI News"
    ],
    fonte: "OpenAI",
    capa: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80",
    whyItMatters: "Reduz o tempo para prototipar agentes com ferramentas e observabilidade — ainda exige guardrails e revisão humana na Loft.",
    blocks: [
      {
        type: "paragraph",
        text: "Em 11 de março de 2025, a OpenAI publicou “New tools for building agents”. Abaixo, a matéria oficial condensada e adaptada ao formato do AI Hub, com a íntegra dos pontos publicados."
      },
      {
        type: "heading",
        title: "O problema que a OpenAI descreve"
      },
      {
        type: "paragraph",
        text: "A empresa define agentes como sistemas que realizam tarefas de forma independente em nome do usuário. Apesar dos avanços de raciocínio e multimodalidade, clientes relatavam dificuldade em levar agentes a produção: muita iteração de prompt, orquestração customizada e pouca visibilidade."
      },
      {
        type: "heading",
        title: "O que foi lançado"
      },
      {
        type: "list",
        items: [
          "Responses API — combina simplicidade do Chat Completions com capacidades de tools da Assistants API",
          "Ferramentas built-in: web search, file search e computer use",
          "Agents SDK open-source — orquestração single/multi-agent, handoffs, guardrails e tracing (evolução do Swarm)",
          "Observabilidade para inspecionar a execução do workflow do agente"
        ]
      },
      {
        type: "paragraph",
        text: "O Agents SDK funciona com Responses API e Chat Completions, e com modelos de outros provedores que exponham endpoint estilo Chat Completions. Há SDKs em Python e TypeScript."
      },
      {
        type: "heading",
        title: "O que observar antes de produção na Loft"
      },
      {
        type: "list",
        items: [
          "Quais ações o agente pode executar sozinho",
          "Como registrar e revisar decisões (tracing)",
          "Custo e latência em fluxos reais",
          "Handoffs entre agentes vs. um único agente inchado"
        ]
      },
      {
        type: "callout",
        title: "Por que isso importa?",
        text: "O ganho real só aparece com ferramentas limitadas, auditoria e medição de qualidade — não só “ligar o agente”."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "OpenAI — New tools for building agents (openai.com/index/new-tools-for-building-agents/), 11/03/2025.\nOpenAI Agents SDK — openai.github.io/openai-agents-python.\nOpenAI — A practical guide to building agents.\nMicrosoft Reactor — Copilot e Agentes de IA (vídeo em português para paralelo conceitual)."
      }
    ],
    relacionados: [
      "tutorial-primeiro-agente",
      "post-o-que-sao-agentes",
      "news-claude-computer-use"
    ]
  },
  {
    id: "news-claude-computer-use",
    kind: "news",
    titulo: "Anthropic: Claude com computer use (beta público)",
    descricao: "Matéria baseada no anúncio oficial da Anthropic: Claude 3.5 Sonnet opera tela, mouse e teclado — com alertas de segurança.",
    cor: "#25302c",
    tags: [
      "Claude",
      "Anthropic",
      "Agentes",
      "AI News"
    ],
    fonte: "Anthropic",
    capa: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1400&q=80",
    whyItMatters: "Abre automações em sistemas sem API, mas aumenta risco se o agente tiver acesso amplo demais.",
    blocks: [
      {
        type: "paragraph",
        text: "Em outubro de 2024, a Anthropic anunciou computer use em beta público com o Claude 3.5 Sonnet atualizado. Conteúdo adaptado do anúncio oficial."
      },
      {
        type: "heading",
        title: "O que é computer use"
      },
      {
        type: "paragraph",
        text: "Desenvolvedores podem instruir o Claude a usar computadores como pessoas: olhar a tela, mover o cursor, clicar e digitar. A Anthropic descreveu a capacidade como experimental — às vezes lenta e sujeita a erros — e pediu feedback precoce."
      },
      {
        type: "heading",
        title: "Disponibilidade"
      },
      {
        type: "paragraph",
        text: "Computer use foi disponibilizado via API Anthropic, Amazon Bedrock e Google Cloud Vertex AI. A empresa também publicou notas de pesquisa (“Developing a computer use model”) sobre segurança e avaliações."
      },
      {
        type: "heading",
        title: "Checklist de segurança (do próprio anúncio / guia)"
      },
      {
        type: "list",
        items: [
          "Ambiente isolado e contas de teste",
          "Lista explícita do que o agente pode clicar",
          "Log de cada ação para auditoria",
          "Nunca deixar o modelo “solto” em notebook com dados reais de cliente"
        ]
      },
      {
        type: "callout",
        title: "Por que isso importa na Loft?",
        text: "Use apenas em fluxos delimitados (formulário interno, conta de teste). Prefira integrações via API/MCP quando existirem."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Anthropic — Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku (anthropic.com/news).\nAnthropic — Developing a computer use model.\nDocumentação Anthropic — computer use tool."
      }
    ],
    relacionados: [
      "tutorial-primeiro-agente",
      "post-o-que-sao-agentes",
      "post-mcp-explicado"
    ]
  },
  {
    id: "news-microsoft-copilot-studio",
    kind: "news",
    titulo: "Microsoft Brasil: bootcamp gratuito de GitHub Copilot",
    descricao: "Matéria completa do Microsoft News Center Brasil (23/01/2025) sobre o bootcamp Learn Live com certificado Microsoft Learn.",
    cor: "#115644",
    tags: [
      "Microsoft",
      "Copilot",
      "AI News"
    ],
    fonte: "Microsoft Brasil",
    capa: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1400&q=80",
    whyItMatters: "Capacitação oficial em português sobre prompts, apps com IA, testes e produtividade — alinhada ao que o time de engenharia já usa.",
    blocks: [
      {
        type: "paragraph",
        text: "São Paulo, 23 de janeiro de 2025 — texto integral adaptado da matéria do Microsoft News Center Brasil."
      },
      {
        type: "paragraph",
        text: "A Microsoft Brasil abriu inscrições para o Bootcamp de GitHub Copilot, capacitação gratuita para desenvolvedores e estudantes. Foram 4 aulas ao vivo e on-line, entre 4 e 13 de fevereiro, com cadastro pelo Microsoft Reactor. Não havia pré-requisitos. Quem concluísse os 4 módulos receberia certificado do Microsoft Learn."
      },
      {
        type: "paragraph",
        text: "O objetivo: ampliar acesso ao conhecimento técnico e melhores práticas do GitHub Copilot, ferramenta que auxilia a escrever código com IA. Instrutores especialistas abordaram prompts eficazes até automação de tarefas repetitivas."
      },
      {
        type: "paragraph",
        text: "A iniciativa faz parte do Learn Live, programa global da Microsoft. Após as sessões ao vivo, as aulas ficam sob demanda. Em 2024, mais de 150 mil pessoas foram capacitadas na América Latina pelo Learn Live."
      },
      {
        type: "heading",
        title: "Sessões do bootcamp"
      },
      {
        type: "list",
        items: [
          "4/02 — Engenharia de Prompt com o GitHub Copilot: fundamentos, IA responsável e uso em diferentes ambientes",
          "6/02 — Aplicação Web de IA com Python e Flask, simplificando tarefas com Copilot",
          "11/02 — Testes unitários e documentação com GitHub Copilot",
          "13/02 — Otimização de fluxo de trabalho, automatizando tarefas repetitivas"
        ]
      },
      {
        type: "callout",
        title: "Por que isso importa?",
        text: "Mesmo após as datas, o modelo de capacitação e os temas (prompt, responsabilidade, testes) continuam o checklist mínimo para adotar Copilot na Loft."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Microsoft News Center Brasil — Microsoft abre inscrições para treinamento gratuito de GitHub Copilot (news.microsoft.com/pt-br), 23/01/2025.\nMicrosoft Reactor — série Copilot e Agentes / GitHub Copilot (YouTube, português)."
      }
    ],
    relacionados: [
      "tutorial-prompts-equipe",
      "post-cursor-ai-studio",
      "tutorial-avaliar-ia"
    ]
  },
  {
    id: "news-regulacao-ia-brasil",
    kind: "news",
    titulo: "Projeto regulamenta uso da inteligência artificial no Brasil (PL 2338/23)",
    descricao: "Matéria completa da Agência Câmara de Notícias (15/05/2025) sobre o PL já aprovado no Senado.",
    cor: "#115644",
    tags: [
      "Regulação",
      "Governança",
      "AI News"
    ],
    fonte: "Câmara dos Deputados",
    capa: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1400&q=80",
    whyItMatters: "Quem documenta propósito, dados e supervisão humana hoje sofre menos depois — inclusive em demos internas.",
    blocks: [
      {
        type: "paragraph",
        text: "Da Agência Câmara — 15/05/2025 — 11:26. Texto adaptado da matéria oficial, preservando o conteúdo publicado."
      },
      {
        type: "paragraph",
        text: "A Câmara dos Deputados analisa o Projeto de Lei 2338/23, do Senado, que regulamenta o uso da inteligência artificial no Brasil. A proposta classifica sistemas quanto aos níveis de risco para a vida humana e de ameaça aos direitos fundamentais. Também divide aplicações em duas categorias: inteligência artificial; e inteligência artificial generativa."
      },
      {
        type: "heading",
        title: "Definições"
      },
      {
        type: "paragraph",
        text: "O texto define inteligência artificial como sistema baseado em máquina capaz de, a partir de dados ou informações, gerar resultados como previsão, conteúdo, recomendação ou decisão que possa influenciar o ambiente virtual, físico ou real. Já a IA generativa é o modelo destinado a gerar ou modificar significativamente texto, imagens, áudio, vídeo ou código."
      },
      {
        type: "paragraph",
        text: "Apenas sistemas de IA generativa e de propósito geral (GPT, por exemplo) deverão ter avaliação preliminar de risco. Nos demais casos, a avaliação prévia será facultativa. A análise deve ser feita por desenvolvedores, fornecedores ou aplicadores antes da chegada ao mercado."
      },
      {
        type: "heading",
        title: "Proteção a direitos fundamentais"
      },
      {
        type: "paragraph",
        text: "Sistemas de risco excessivo ficam proibidos — entre eles armas autônomas, sistemas para produzir/disseminar abuso sexual de crianças e adolescentes, e avaliação de personalidade/comportamento para prever crimes. Uso de câmeras para identificar pessoas em espaços públicos só em casos específicos (vítimas, desaparecidos, recaptura), com limites de pena, autorização judicial e subsidiariedade."
      },
      {
        type: "heading",
        title: "Direitos autorais"
      },
      {
        type: "paragraph",
        text: "Conteúdos protegidos poderão ser usados livremente somente por instituições de pesquisa, jornalismo, museus, arquivos, bibliotecas e organizações educacionais, com obtenção legítima e sem fins comerciais. Nos demais casos, o titular poderá proibir o uso; se obras forem usadas em sistemas comerciais, haverá direito a remuneração."
      },
      {
        type: "heading",
        title: "Tramitação"
      },
      {
        type: "paragraph",
        text: "O projeto será analisado inicialmente por comissão especial. Já aprovado no Senado, precisa da Câmara para virar lei."
      },
      {
        type: "callout",
        title: "Por que isso importa na Loft?",
        text: "Mapeie sistemas internos por risco, documente finalidade/dados e mantenha humano no loop em decisões de alto impacto."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Agência Câmara de Notícias — Projeto regulamenta uso da inteligência artificial no Brasil (camara.leg.br), 15/05/2025.\nSenado Federal — PL 2338/2023 (matéria e tramitação)."
      }
    ],
    relacionados: [
      "post-dados-sensiveis",
      "tutorial-avaliar-ia"
    ]
  },
  {
    id: "news-automacao-empresarial",
    kind: "news",
    titulo: "Automação com IA deixa de ser experimento",
    descricao: "Como Microsoft, Google e AWS descrevem o caminho de piloto a produção: dono, métrica, governança e rollback.",
    cor: "#25302c",
    tags: [
      "Automação",
      "Agentes",
      "AI News"
    ],
    fonte: "Mercado / Oficiais",
    capa: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1400&q=80",
    whyItMatters: "O padrão vencedor é o que queremos na Loft: automação com dono, alerta e caminho humano quando falha.",
    blocks: [
      {
        type: "paragraph",
        text: "Materiais oficiais de Microsoft Reactor (agentes e automações), Google (Gemini Enterprise) e AWS Developers LATAM (GenAI/Bedrock) convergem: sair do demo exige operação."
      },
      {
        type: "heading",
        title: "O padrão que está vencendo"
      },
      {
        type: "list",
        items: [
          "Dono nomeado do fluxo",
          "Métrica de qualidade (golden set / taxa de escalonamento)",
          "Plano B quando a IA erra",
          "Controles de publicação (maker/admin)",
          "Logs sem vazamento de PII"
        ]
      },
      {
        type: "paragraph",
        text: "Ferramentas low-code (Copilot Studio, Power Automate) e open-source (n8n) baixam a barreira de construção — não a de responsabilidade."
      },
      {
        type: "callout",
        title: "Fontes",
        text: "Microsoft Reactor — Agentes em ação / Governança de Agentes (YouTube, português).\nGoogle Cloud — Gemini Enterprise (blog oficial pt-BR).\nAWS Developers LATAM — IA generativa na AWS (YouTube, português)."
      }
    ],
    relacionados: [
      "tutorial-n8n-zero",
      "tutorial-avaliar-ia",
      "post-7-tarefas-automatizar"
    ]
  },
  {
    id: "news-rag-empresa",
    kind: "news",
    titulo: "RAG vira padrão em knowledge bases empresariais",
    descricao: "Como AWS, Google e o mercado consolidam busca + geração com fontes internas, citações e controle de acesso.",
    cor: "#25302c",
    tags: [
      "RAG",
      "Dados",
      "AWS",
      "AI News"
    ],
    fonte: "AWS / Mercado",
    capa: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
    whyItMatters: "Respostas com fonte rastreável reduzem alucinação e aumentam confiança do time.",
    blocks: [
      {
        type: "paragraph",
        text: "RAG (retrieval-augmented generation) tornou-se arquitetura padrão para grounding em dados empresariais. A AWS Developers LATAM demonstra aplicações práticas com Amazon Bedrock; Google Cloud posiciona Vertex AI Search / grounding no mesmo espaço."
      },
      {
        type: "heading",
        title: "O que observar"
      },
      {
        type: "list",
        items: [
          "Qualidade e atualização dos documentos",
          "ACL no retrieval (quem vê o quê)",
          "Métricas de citação correta vs. inventada",
          "Separação entre ambiente de teste e produção"
        ]
      },
      {
        type: "callout",
        title: "Fontes",
        text: "AWS Developers LATAM — Inteligência Artificial Generativa na AWS | Amazon Bedrock (YouTube, português).\nAWS — documentação de Knowledge Bases / RAG.\nGoogle Cloud — Vertex AI Search e grounding."
      }
    ],
    relacionados: [
      "tutorial-rag-interno",
      "tutorial-avaliar-ia"
    ]
  },
  {
    id: "video-comecar-ia",
    kind: "video",
    titulo: "O que é Generative AI? — AWS Developers LATAM",
    descricao: "Vídeo oficial em português sobre fundamentos de IA generativa.",
    cor: "#115644",
    tags: [
      "IA",
      "Produtividade"
    ],
    duracao: "15 min",
    tutorialId: "guia-comecar-ia-dia-a-dia",
    videoUrl: "https://www.youtube.com/embed/4tqGA3-JXUc",
    capa: "https://i.ytimg.com/vi/4tqGA3-JXUc/hqdefault.jpg",
    blocks: []
  },
  {
    id: "video-primeiro-agente",
    kind: "video",
    titulo: "Copilot e Agentes de IA — Microsoft Reactor",
    descricao: "O que são agentes e como funcionam no ecossistema Copilot.",
    cor: "#25302c",
    tags: [
      "Agentes",
      "Copilot"
    ],
    duracao: "45 min",
    tutorialId: "tutorial-primeiro-agente",
    videoUrl: "https://www.youtube.com/embed/FgndV_6joy4",
    capa: "https://i.ytimg.com/vi/FgndV_6joy4/hqdefault.jpg",
    blocks: []
  },
  {
    id: "video-n8n-zero",
    kind: "video",
    titulo: "Agentes em ação: automações comerciais — Microsoft Reactor",
    descricao: "Personalize e gerencie automações com agentes (português).",
    cor: "#d94616",
    tags: [
      "Automação",
      "Agentes"
    ],
    duracao: "40 min",
    tutorialId: "tutorial-n8n-zero",
    videoUrl: "https://www.youtube.com/embed/nMdSjpB1QIg",
    capa: "https://i.ytimg.com/vi/nMdSjpB1QIg/hqdefault.jpg",
    blocks: []
  },
  {
    id: "video-rag-interno",
    kind: "video",
    titulo: "IA generativa na AWS | Amazon Bedrock — AWS LATAM",
    descricao: "Aplicações práticas de GenAI e bases de conhecimento.",
    cor: "#25302c",
    tags: [
      "RAG",
      "Dados",
      "AWS"
    ],
    duracao: "45 min",
    tutorialId: "tutorial-rag-interno",
    videoUrl: "https://www.youtube.com/embed/55nzTrFfE2s",
    capa: "https://i.ytimg.com/vi/55nzTrFfE2s/hqdefault.jpg",
    blocks: []
  },
  {
    id: "video-prompts-equipe",
    kind: "video",
    titulo: "GitHub Copilot para desenvolver apps — Microsoft Reactor",
    descricao: "Engenharia de prompt e produtividade no fluxo de código.",
    cor: "#115644",
    tags: [
      "Prompts",
      "Copilot"
    ],
    duracao: "40 min",
    tutorialId: "tutorial-prompts-equipe",
    videoUrl: "https://www.youtube.com/embed/OjafdmTGJL0",
    capa: "https://i.ytimg.com/vi/OjafdmTGJL0/hqdefault.jpg",
    blocks: []
  },
  {
    id: "video-avaliar-ia",
    kind: "video",
    titulo: "Governança de Agentes do Copilot — Microsoft Reactor",
    descricao: "Controles para publicar e operar agentes com segurança.",
    cor: "#25302c",
    tags: [
      "Governança",
      "Agentes"
    ],
    duracao: "40 min",
    tutorialId: "tutorial-avaliar-ia",
    videoUrl: "https://www.youtube.com/embed/pQodC3y9inI",
    capa: "https://i.ytimg.com/vi/pQodC3y9inI/hqdefault.jpg",
    blocks: []
  },
  {
    id: "video-slack-bot",
    kind: "video",
    titulo: "Criando e Gerenciando Agentes: Do Zero à Produção",
    descricao: "Microsoft Reactor — caminho operacional de agentes em português.",
    cor: "#ff774a",
    tags: [
      "Agentes",
      "Automação"
    ],
    duracao: "45 min",
    tutorialId: "tutorial-slack-bot",
    videoUrl: "https://www.youtube.com/embed/CxK4NgTQdMc",
    capa: "https://i.ytimg.com/vi/CxK4NgTQdMc/hqdefault.jpg",
    blocks: []
  },
  {
    id: "video-gemini-spark",
    kind: "video",
    titulo: "Gemini Spark — Google Brasil",
    descricao: "Assistente de IA do Google que organiza tarefas, e-mails e agenda.",
    cor: "#115644",
    tags: [
      "Gemini",
      "Google",
      "Produtividade"
    ],
    duracao: "5 min",
    tutorialId: "news-gemini-enterprise",
    videoUrl: "https://www.youtube.com/embed/9pvbTac3NR8",
    capa: "https://i.ytimg.com/vi/9pvbTac3NR8/hqdefault.jpg",
    blocks: []
  }
];

export function getHubContent(id?: string) {
  return hubContents.find((c) => c.id === id);
}

export function hubByKind(kind: HubContent["kind"]) {
  return hubContents.filter((c) => c.kind === kind);
}
