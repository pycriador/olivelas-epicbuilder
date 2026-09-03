import type { CaseItem } from "./types";

export const cases: CaseItem[] = [
  {
    id: "analise-feedback",
    nome: "Análise Inteligente de Feedback",
    descricao:
      "Classificação automática de comentários de clientes em temas, sentimento e urgência, com resumo semanal para os times de produto.",
    area: "Produto",
    ferramentas: ["ChatGPT", "n8n", "APIs de IA"],
    impacto: "Alto",
    status: "Em produção",
    time: "Produto — Experiência do Cliente",
    responsaveis: ["Marina Alves", "Rafael Kondo"],
    acessos: 1284,
    destaque: true,
    cor: "#115644",
    problema:
      "O time recebia mais de 4 mil comentários por mês em pesquisas, app stores e canais de atendimento. A leitura era manual, feita em planilhas, e boa parte dos temas críticos só era percebida semanas depois.",
    solucao:
      "Um fluxo em n8n coleta os comentários das fontes, envia para um modelo de linguagem que classifica tema, sentimento e urgência, e devolve um resumo estruturado para o painel do time.",
    antes: [
      "Leitura manual de planilhas por 2 pessoas",
      "~12 horas por semana de tabulação",
      "Temas críticos detectados com 3 semanas de atraso",
      "Categorias inconsistentes entre analistas",
    ],
    depois: [
      "Classificação automática em minutos",
      "~1 hora por semana de revisão",
      "Alertas de urgência no mesmo dia",
      "Taxonomia única e auditável",
    ],
    fluxo: ["Dados", "Automação", "IA", "Processamento", "Resultado"],
    etapas: [
      {
        titulo: "Centralizar as fontes de feedback",
        texto:
          "Conecte pesquisas, avaliações de loja e tickets em uma única tabela. O importante é padronizar três campos: texto, origem e data.",
        dica: "Comece com uma fonte só. Ampliar depois é trivial; consertar taxonomia bagunçada não é.",
      },
      {
        titulo: "Definir a taxonomia de temas",
        texto:
          "Liste entre 8 e 15 temas fechados com o time. Temas demais tornam o resultado difícil de acionar.",
        exemplo: "Preço, Atendimento, Agendamento de visita, Documentação, Performance do app...",
      },
      {
        titulo: "Escrever o prompt de classificação",
        texto:
          "Peça saída estruturada e proíba temas fora da lista. Isso reduz drasticamente o retrabalho.",
        prompt:
          'Classifique o comentário abaixo. Responda apenas em JSON com as chaves "tema", "sentimento" (positivo|neutro|negativo) e "urgencia" (baixa|media|alta). Use exclusivamente os temas desta lista: {{lista_de_temas}}.\n\nComentário: """{{texto}}"""',
      },
      {
        titulo: "Automatizar a execução",
        texto:
          "No n8n, agende a coleta, faça a chamada ao modelo em lote e grave o resultado de volta na base.",
        dica: "Processe em lotes de 20 comentários por chamada para reduzir custo e tempo.",
      },
      {
        titulo: "Fechar o ciclo com o time",
        texto:
          "Envie um resumo semanal com os 5 temas que mais cresceram e uma amostra de comentários reais de cada um.",
      },
    ],
    resultados: [
      { label: "Horas economizadas / ano", valor: "570h" },
      { label: "Comentários processados / mês", valor: "4.200" },
      { label: "Acurácia em amostra revisada", valor: "91%" },
      { label: "Tempo até detectar tema crítico", valor: "1 dia", detalhe: "antes: 21 dias" },
    ],
    aprendizados: [
      "Taxonomia curta e fechada vale mais do que prompt sofisticado.",
      "Revisão humana de 5% da amostra por semana mantém a confiança do time.",
      "Saída em JSON evita 80% dos problemas de integração.",
    ],
    aulasRelacionadas: ["aula-prompt-estruturado", "aula-n8n-primeiro-fluxo"],
    templatesRelacionados: ["tpl-classificacao-texto", "tpl-resumo-semanal"],
    ferramentasRelacionadas: ["chatgpt", "n8n", "apis-ia"],
    casesRelacionados: ["triagem-atendimento", "resumo-reunioes"],
    tags: ["feedback", "nps", "classificação", "voz do cliente", "sentimento"],
  },
  {
    id: "triagem-atendimento",
    nome: "Triagem Automática de Atendimento",
    descricao:
      "Agente que lê o primeiro contato do cliente, identifica a intenção e direciona para a fila correta com resumo pronto.",
    area: "Operações",
    ferramentas: ["APIs de IA", "n8n", "Loft Copilot"],
    impacto: "Alto",
    status: "Em produção",
    time: "Operações — Atendimento",
    responsaveis: ["Camila Duarte"],
    acessos: 964,
    destaque: true,
    cor: "#ff774a",
    problema:
      "Mensagens caíam em uma fila única e eram redistribuídas manualmente. O tempo médio até o primeiro atendimento útil passava de 40 minutos.",
    solucao:
      "Um agente classifica intenção e urgência, redige um resumo de três linhas e roteia o atendimento para a fila especializada.",
    antes: [
      "Fila única com triagem manual",
      "40 min até o primeiro atendimento útil",
      "Retrabalho de contexto entre times",
    ],
    depois: [
      "Roteamento automático em segundos",
      "11 min até o primeiro atendimento útil",
      "Resumo pronto na abertura do ticket",
    ],
    fluxo: ["Dados", "Automação", "IA", "Processamento", "Resultado"],
    etapas: [
      {
        titulo: "Mapear as filas reais",
        texto: "Antes de automatizar, confirme quais filas existem e quem é dono de cada uma.",
        dica: "Automatizar um processo confuso só deixa a confusão mais rápida.",
      },
      {
        titulo: "Criar o classificador de intenção",
        texto: "Modelo recebe a mensagem e devolve intenção, urgência e fila sugerida.",
        prompt:
          'Você é um triador de atendimento. Dada a mensagem do cliente, responda em JSON com "intencao", "urgencia" e "fila". Se a confiança for baixa, use fila "humano".',
      },
      {
        titulo: "Definir o caminho de escape",
        texto:
          "Toda classificação com baixa confiança vai para uma pessoa. O agente nunca deve adivinhar.",
      },
      {
        titulo: "Medir antes de expandir",
        texto: "Rode em 10% do volume por duas semanas comparando com a triagem manual.",
      },
    ],
    resultados: [
      { label: "Horas economizadas / ano", valor: "1.900h" },
      { label: "Tempo até 1º atendimento", valor: "-72%" },
      { label: "Acerto de roteamento", valor: "94%" },
      { label: "Atendimentos / mês", valor: "12.600" },
    ],
    aprendizados: [
      "O caminho de escape para humano é o que sustenta a confiança.",
      "Resumo automático economiza mais tempo do que o roteamento em si.",
    ],
    aulasRelacionadas: ["aula-agentes-conceito", "aula-guardrails"],
    templatesRelacionados: ["tpl-agente-triagem", "tpl-classificacao-texto"],
    ferramentasRelacionadas: ["apis-ia", "n8n", "loft-copilot"],
    casesRelacionados: ["analise-feedback", "base-conhecimento"],
    tags: ["atendimento", "triagem", "agente", "roteamento", "suporte"],
  },
  {
    id: "descricao-anuncios",
    nome: "Gerador de Descrição de Anúncios",
    descricao:
      "Geração assistida de textos de anúncio de imóveis a partir de dados estruturados, com revisão humana obrigatória.",
    area: "Marketing",
    ferramentas: ["ChatGPT", "Loft Studio"],
    impacto: "Médio",
    status: "Em produção",
    time: "Marketing — Conteúdo",
    responsaveis: ["Bruno Tavares"],
    acessos: 812,
    cor: "#d94616",
    problema:
      "Cada anúncio exigia redação manual a partir de uma ficha técnica. O padrão de qualidade variava muito entre redatores.",
    solucao:
      "A ficha estruturada alimenta um prompt com guia de estilo da marca. O texto sai pronto para revisão, nunca para publicação automática.",
    antes: ["18 minutos por anúncio", "Tom inconsistente", "Checklist de conformidade manual"],
    depois: ["4 minutos por anúncio", "Tom padronizado pelo guia", "Checklist embutido no prompt"],
    fluxo: ["Dados", "Automação", "IA", "Processamento", "Resultado"],
    etapas: [
      {
        titulo: "Transformar o guia de estilo em regras",
        texto: "Frases curtas, o que nunca dizer, termos proibidos e formato de saída.",
        dica: "Regras negativas ('nunca prometa valorização') funcionam melhor que adjetivos.",
      },
      {
        titulo: "Montar o prompt com a ficha",
        texto: "Injete apenas campos verificáveis: metragem, bairro, andar, diferenciais.",
        prompt:
          "Escreva a descrição de um anúncio em até 90 palavras usando somente os dados abaixo. Não invente nenhuma característica ausente. Tom: direto e informativo.\n\nDados: {{ficha}}",
      },
      {
        titulo: "Revisão humana obrigatória",
        texto: "Nenhum texto vai ao ar sem aprovação. O ganho está na primeira versão, não no envio.",
      },
    ],
    resultados: [
      { label: "Horas economizadas / ano", valor: "740h" },
      { label: "Tempo por anúncio", valor: "-78%" },
      { label: "Anúncios / mês", valor: "1.100" },
    ],
    aprendizados: [
      "Proibir invenção de dados é a regra mais importante do prompt.",
      "Guia de estilo escrito como lista de regras supera exemplos soltos.",
    ],
    aulasRelacionadas: ["aula-prompt-estruturado", "aula-ia-escrita"],
    templatesRelacionados: ["tpl-copy-marca", "tpl-revisao-conteudo"],
    ferramentasRelacionadas: ["chatgpt", "loft-studio"],
    casesRelacionados: ["seo-conteudo", "resumo-reunioes"],
    tags: ["conteúdo", "copy", "anúncio", "marketing", "texto"],
  },
  {
    id: "resumo-reunioes",
    nome: "Resumo Automático de Reuniões",
    descricao:
      "Transcrição e resumo de reuniões com extração de decisões, responsáveis e próximos passos enviados no canal do time.",
    area: "Produto",
    ferramentas: ["APIs de IA", "n8n"],
    impacto: "Médio",
    status: "Em produção",
    time: "Produto — Discovery",
    responsaveis: ["Marina Alves"],
    acessos: 1032,
    cor: "#25302c",
    problema:
      "Decisões importantes ficavam apenas na memória dos participantes e as atas raramente eram escritas.",
    solucao:
      "A gravação é transcrita e resumida em três blocos fixos: decisões, pendências e próximos passos com responsável.",
    antes: ["Atas escritas em 30% das reuniões", "Decisões perdidas", "Follow-up manual"],
    depois: ["Resumo em 100% das reuniões gravadas", "Decisões registradas", "Follow-up automático"],
    fluxo: ["Dados", "Automação", "IA", "Processamento", "Resultado"],
    etapas: [
      {
        titulo: "Padronizar a captura",
        texto: "Só reuniões com gravação ativa entram no fluxo. Comunique isso no convite.",
      },
      {
        titulo: "Resumo com estrutura fixa",
        texto: "Três blocos sempre iguais tornam o resultado escaneável.",
        prompt:
          "Resuma a transcrição em três blocos: DECISÕES, PENDÊNCIAS e PRÓXIMOS PASSOS (com responsável e prazo quando citados). Não inclua nada que não tenha sido dito.",
      },
      {
        titulo: "Entregar onde o time já está",
        texto: "Poste no canal da squad em vez de criar mais um lugar para procurar.",
        dica: "Automação que exige abrir uma ferramenta nova costuma morrer em duas semanas.",
      },
    ],
    resultados: [
      { label: "Horas economizadas / ano", valor: "980h" },
      { label: "Reuniões cobertas / mês", valor: "340" },
      { label: "Adoção entre squads", valor: "76%" },
    ],
    aprendizados: [
      "Estrutura fixa de saída importa mais do que qualidade do modelo.",
      "Entregar no canal existente foi o que garantiu adoção.",
    ],
    aulasRelacionadas: ["aula-produtividade-rotina", "aula-n8n-primeiro-fluxo"],
    templatesRelacionados: ["tpl-resumo-reuniao", "tpl-resumo-semanal"],
    ferramentasRelacionadas: ["apis-ia", "n8n"],
    casesRelacionados: ["base-conhecimento", "analise-feedback"],
    tags: ["reunião", "ata", "resumo", "produtividade", "transcrição"],
  },
  {
    id: "base-conhecimento",
    nome: "Busca Semântica na Base Interna",
    descricao:
      "Busca por significado na documentação interna, com respostas citando o documento de origem.",
    area: "Engenharia",
    ferramentas: ["APIs de IA", "Loft Copilot"],
    impacto: "Alto",
    status: "Piloto",
    time: "Engenharia — Plataforma",
    responsaveis: ["Rafael Kondo", "Camila Duarte"],
    acessos: 741,
    novo: true,
    cor: "#115644",
    problema:
      "Documentação espalhada em quatro ferramentas. A busca por palavra exata falhava sempre que o termo usado era diferente.",
    solucao:
      "Os documentos são indexados por embeddings e a resposta é gerada apenas a partir dos trechos recuperados, sempre com link para a fonte.",
    antes: ["Busca por palavra exata", "Resposta em ~25 min", "Perguntas repetidas no canal"],
    depois: ["Busca por significado", "Resposta em ~2 min", "Respostas com fonte citada"],
    fluxo: ["Dados", "Automação", "IA", "Processamento", "Resultado"],
    etapas: [
      {
        titulo: "Escolher o corpus certo",
        texto: "Indexe só documentação viva. Documento desatualizado indexado vira resposta errada.",
      },
      {
        titulo: "Quebrar em trechos",
        texto: "Divida por seção, mantendo o título junto do conteúdo em cada trecho.",
        dica: "Trechos de 500 a 800 caracteres funcionaram melhor nos nossos testes.",
      },
      {
        titulo: "Responder apenas com o contexto",
        texto: "Se o trecho não responde, o agente deve dizer que não sabe.",
        prompt:
          'Responda à pergunta usando exclusivamente os trechos fornecidos. Cite o título do documento usado. Se a resposta não estiver nos trechos, responda "Não encontrei isso na base".',
      },
    ],
    resultados: [
      { label: "Horas economizadas / ano", valor: "1.350h" },
      { label: "Documentos indexados", valor: "3.400" },
      { label: "Tempo médio de resposta", valor: "-92%" },
    ],
    aprendizados: [
      "Citar a fonte é o que faz as pessoas confiarem na resposta.",
      "Curadoria do corpus vale mais do que ajuste fino de modelo.",
    ],
    aulasRelacionadas: ["aula-embeddings", "aula-agentes-conceito"],
    templatesRelacionados: ["tpl-busca-semantica", "tpl-agente-faq"],
    ferramentasRelacionadas: ["apis-ia", "loft-copilot"],
    casesRelacionados: ["triagem-atendimento", "resumo-reunioes"],
    tags: ["busca", "rag", "documentação", "embeddings", "conhecimento"],
  },
  {
    id: "revisao-codigo",
    nome: "Revisão de Código Assistida",
    descricao:
      "Comentários automáticos em pull requests apontando riscos, testes ausentes e desvios de padrão.",
    area: "Engenharia",
    ferramentas: ["APIs de IA", "Loft Copilot"],
    impacto: "Médio",
    status: "Em produção",
    time: "Engenharia — Developer Experience",
    responsaveis: ["Bruno Tavares"],
    acessos: 688,
    cor: "#25302c",
    problema:
      "Revisões demoravam a começar e comentários repetitivos consumiam o tempo dos revisores mais experientes.",
    solucao:
      "Um bot comenta a primeira rodada com observações objetivas antes da revisão humana, que passa a focar em arquitetura.",
    antes: ["Primeira revisão em ~9h", "Comentários repetitivos", "Padrões aplicados de forma desigual"],
    depois: ["Primeira rodada em minutos", "Revisor foca em decisão de design", "Padrão consistente"],
    fluxo: ["Dados", "Automação", "IA", "Processamento", "Resultado"],
    etapas: [
      {
        titulo: "Delimitar o escopo do bot",
        texto: "Ele comenta riscos e padrões, nunca aprova nem bloqueia sozinho.",
      },
      {
        titulo: "Alimentar com o guia interno",
        texto: "Inclua no prompt as convenções reais do repositório.",
        prompt:
          "Revise o diff abaixo. Aponte no máximo 5 itens objetivos: risco, teste ausente ou desvio de padrão. Não comente estilo já coberto pelo linter.",
      },
      { titulo: "Limitar o número de comentários", texto: "Cinco comentários úteis batem trinta genéricos." },
    ],
    resultados: [
      { label: "Horas economizadas / ano", valor: "1.100h" },
      { label: "Tempo até 1ª revisão", valor: "-85%" },
      { label: "PRs cobertos / mês", valor: "620" },
    ],
    aprendizados: [
      "Limitar a quantidade de comentários aumentou a adoção.",
      "O bot não deve duplicar o que o linter já faz.",
    ],
    aulasRelacionadas: ["aula-ia-engenharia", "aula-guardrails"],
    templatesRelacionados: ["tpl-code-review", "tpl-checklist-qualidade"],
    ferramentasRelacionadas: ["apis-ia", "loft-copilot", "lovable"],
    casesRelacionados: ["base-conhecimento", "qa-testes"],
    tags: ["código", "pull request", "engenharia", "revisão", "qualidade"],
  },
  {
    id: "previsao-demanda",
    nome: "Previsão de Demanda por Região",
    descricao:
      "Modelo que estima volume de interesse por região e alimenta o planejamento semanal do time comercial.",
    area: "Comercial",
    ferramentas: ["APIs de IA", "Loft Insights"],
    impacto: "Alto",
    status: "Piloto",
    time: "Comercial — Inteligência de Mercado",
    responsaveis: ["Marina Alves"],
    acessos: 523,
    novo: true,
    cor: "#115644",
    problema:
      "O planejamento de capacidade era feito com base no histórico do mês anterior, sem considerar sazonalidade nem sinais recentes.",
    solucao:
      "Uma rotina semanal combina histórico e sinais de busca, gera a previsão por região e um comentário em linguagem natural sobre o que mudou.",
    antes: ["Planejamento pelo mês anterior", "Erro médio alto em regiões pequenas", "Leitura demorada dos dados"],
    depois: ["Previsão semanal por região", "Erro médio reduzido", "Resumo explicando as variações"],
    fluxo: ["Dados", "Automação", "IA", "Processamento", "Resultado"],
    etapas: [
      { titulo: "Consolidar o histórico", texto: "Séries limpas por região e semana são metade do trabalho." },
      { titulo: "Gerar a previsão", texto: "Rodada semanal automatizada com registro de versão." },
      {
        titulo: "Explicar em linguagem natural",
        texto: "O modelo de linguagem descreve as três maiores variações da semana.",
        prompt:
          "Compare a previsão desta semana com a anterior e descreva em até 5 linhas as três maiores variações por região, sem especular causas não presentes nos dados.",
      },
    ],
    resultados: [
      { label: "Horas economizadas / ano", valor: "620h" },
      { label: "Regiões cobertas", valor: "34" },
      { label: "Erro médio", valor: "-31%" },
    ],
    aprendizados: [
      "A explicação em texto foi o que fez o time usar o modelo.",
      "Previsão sem dono do processo vira relatório ignorado.",
    ],
    aulasRelacionadas: ["aula-dados-ia", "aula-ia-negocio"],
    templatesRelacionados: ["tpl-analise-serie", "tpl-resumo-semanal"],
    ferramentasRelacionadas: ["apis-ia", "loft-insights"],
    casesRelacionados: ["scoring-leads", "conciliacao-financeira"],
    tags: ["previsão", "demanda", "comercial", "dados", "planejamento"],
  },
  {
    id: "scoring-leads",
    nome: "Priorização Inteligente de Leads",
    descricao:
      "Ordenação da fila de contatos por probabilidade de avanço, com justificativa legível para o consultor.",
    area: "Comercial",
    ferramentas: ["Loft Insights", "n8n"],
    impacto: "Alto",
    status: "Em produção",
    time: "Comercial — Growth",
    responsaveis: ["Camila Duarte"],
    acessos: 877,
    destaque: true,
    cor: "#ff774a",
    problema:
      "Consultores atendiam a fila em ordem de chegada, gastando o mesmo esforço em contatos com potencial muito diferente.",
    solucao:
      "Um score ordena a fila e uma frase gerada automaticamente explica por que aquele contato subiu na lista.",
    antes: ["Fila por ordem de chegada", "Sem critério compartilhado", "Contatos quentes esfriando"],
    depois: ["Fila priorizada", "Justificativa visível", "Contato quente atendido primeiro"],
    fluxo: ["Dados", "Automação", "IA", "Processamento", "Resultado"],
    etapas: [
      { titulo: "Definir o evento de sucesso", texto: "Sem um alvo claro, o score não significa nada." },
      { titulo: "Calcular e publicar o score", texto: "Atualização diária direto na ferramenta do consultor." },
      {
        titulo: "Explicar a prioridade",
        texto: "Uma frase curta com os dois fatores principais aumenta a confiança.",
        exemplo: "Prioridade alta: retornou ao site 3 vezes em 48h e já agendou visita antes.",
      },
    ],
    resultados: [
      { label: "Horas economizadas / ano", valor: "1.480h" },
      { label: "Conversão da fila priorizada", valor: "+22%" },
      { label: "Contatos avaliados / dia", valor: "3.900" },
    ],
    aprendizados: [
      "Score sem explicação é ignorado pelo time de campo.",
      "Atualizar dentro da ferramenta existente foi decisivo.",
    ],
    aulasRelacionadas: ["aula-dados-ia", "aula-ia-negocio"],
    templatesRelacionados: ["tpl-score-priorizacao", "tpl-analise-serie"],
    ferramentasRelacionadas: ["loft-insights", "n8n"],
    casesRelacionados: ["previsao-demanda", "triagem-atendimento"],
    tags: ["leads", "score", "priorização", "comercial", "conversão"],
  },
  {
    id: "conciliacao-financeira",
    nome: "Conciliação Financeira Assistida",
    descricao:
      "Leitura de comprovantes e extratos para sugerir conciliações, deixando para o time apenas as exceções.",
    area: "Financeiro",
    ferramentas: ["n8n", "APIs de IA"],
    impacto: "Alto",
    status: "Em produção",
    time: "Financeiro — Controladoria",
    responsaveis: ["Rafael Kondo"],
    acessos: 612,
    cor: "#25302c",
    problema:
      "Conciliação manual de milhares de lançamentos por mês, com comprovantes em PDF e nomenclaturas inconsistentes.",
    solucao:
      "Extração dos campos do comprovante, sugestão de correspondência com o lançamento e fila de exceções para análise humana.",
    antes: ["Conciliação 100% manual", "Fechamento em 6 dias", "Erros de digitação frequentes"],
    depois: ["78% conciliado automaticamente", "Fechamento em 2 dias", "Fila só com exceções"],
    fluxo: ["Dados", "Automação", "IA", "Processamento", "Resultado"],
    etapas: [
      { titulo: "Extrair campos do documento", texto: "Valor, data, contraparte e identificador." },
      { titulo: "Sugerir correspondência", texto: "Regra determinística primeiro; IA só nos casos ambíguos." },
      {
        titulo: "Fila de exceções",
        texto: "Nada é conciliado automaticamente acima do limite definido pela controladoria.",
        dica: "Em finanças, o valor está em reduzir a fila — não em eliminar a revisão.",
      },
    ],
    resultados: [
      { label: "Horas economizadas / ano", valor: "2.100h" },
      { label: "Conciliação automática", valor: "78%" },
      { label: "Dias de fechamento", valor: "2", detalhe: "antes: 6" },
    ],
    aprendizados: [
      "Regra determinística resolve a maior parte; IA cobre a cauda.",
      "Limite de valor para revisão obrigatória é inegociável.",
    ],
    aulasRelacionadas: ["aula-n8n-avancado", "aula-guardrails"],
    templatesRelacionados: ["tpl-extracao-documento", "tpl-fila-excecoes"],
    ferramentasRelacionadas: ["n8n", "apis-ia"],
    casesRelacionados: ["contratos-extracao", "previsao-demanda"],
    tags: ["financeiro", "conciliação", "documento", "automação", "fechamento"],
  },
  {
    id: "contratos-extracao",
    nome: "Extração de Cláusulas de Contratos",
    descricao:
      "Leitura de contratos para extrair prazos, valores e cláusulas críticas em uma tabela comparável.",
    area: "Operações",
    ferramentas: ["APIs de IA", "Loft Studio"],
    impacto: "Médio",
    status: "Em desenvolvimento",
    time: "Operações — Jurídico Operacional",
    responsaveis: ["Bruno Tavares"],
    acessos: 398,
    cor: "#115644",
    problema:
      "Cada consulta a um contrato exigia leitura integral do PDF. Comparar condições entre contratos era inviável na prática.",
    solucao:
      "Extração estruturada das cláusulas mais consultadas, com link para o trecho original de cada campo.",
    antes: ["Leitura integral do PDF", "Comparação inviável", "Prazos descobertos tarde"],
    depois: ["Tabela comparável", "Consulta em segundos", "Alertas de vencimento"],
    fluxo: ["Dados", "Automação", "IA", "Processamento", "Resultado"],
    etapas: [
      { titulo: "Definir os campos críticos", texto: "Comece por 6 a 10 campos realmente consultados." },
      {
        titulo: "Extrair com rastreabilidade",
        texto: "Cada campo extraído precisa apontar para o trecho de origem.",
        prompt:
          'Extraia os campos {{campos}} do contrato. Para cada campo retorne "valor" e "trecho_origem" literal. Se não existir, retorne null.',
      },
      { titulo: "Validar com o time jurídico", texto: "Amostra revisada antes de qualquer uso em decisão." },
    ],
    resultados: [
      { label: "Horas economizadas / ano", valor: "480h" },
      { label: "Contratos processados", valor: "1.850" },
      { label: "Campos extraídos por contrato", valor: "9" },
    ],
    aprendizados: [
      "Rastreabilidade do trecho original destrava a aprovação jurídica.",
      "Campo ausente precisa retornar nulo, não uma suposição.",
    ],
    aulasRelacionadas: ["aula-embeddings", "aula-guardrails"],
    templatesRelacionados: ["tpl-extracao-documento", "tpl-checklist-qualidade"],
    ferramentasRelacionadas: ["apis-ia", "loft-studio"],
    casesRelacionados: ["conciliacao-financeira", "base-conhecimento"],
    tags: ["contrato", "extração", "jurídico", "documento", "cláusula"],
  },
  {
    id: "seo-conteudo",
    nome: "Planejamento de Conteúdo com IA",
    descricao:
      "Agrupamento de temas de busca e sugestão de pautas priorizadas para o calendário editorial.",
    area: "Marketing",
    ferramentas: ["ChatGPT", "Loft Insights", "n8n"],
    impacto: "Médio",
    status: "Piloto",
    time: "Marketing — Growth de Conteúdo",
    responsaveis: ["Marina Alves", "Camila Duarte"],
    acessos: 455,
    cor: "#ff774a",
    problema:
      "O calendário editorial era montado por intuição, com sobreposição de pautas e lacunas em temas de alta demanda.",
    solucao:
      "Os termos de busca são agrupados por intenção e o modelo propõe pautas com ângulo e público, priorizadas por potencial.",
    antes: ["Pauta por intuição", "Sobreposição de temas", "Lacunas não percebidas"],
    depois: ["Pauta orientada por demanda", "Agrupamento por intenção", "Priorização explícita"],
    fluxo: ["Dados", "Automação", "IA", "Processamento", "Resultado"],
    etapas: [
      { titulo: "Coletar termos de busca", texto: "Exporte os termos e limpe duplicidades óbvias." },
      {
        titulo: "Agrupar por intenção",
        texto: "Intenção informativa, comparativa e transacional geram formatos diferentes.",
        prompt:
          "Agrupe os termos abaixo em clusters por intenção de busca. Para cada cluster, sugira um título de pauta e o público-alvo.",
      },
      { titulo: "Priorizar com o time", texto: "A IA propõe; a priorização final continua sendo humana." },
    ],
    resultados: [
      { label: "Horas economizadas / ano", valor: "390h" },
      { label: "Pautas planejadas / trimestre", valor: "120" },
      { label: "Cobertura de temas prioritários", valor: "+45%" },
    ],
    aprendizados: [
      "Agrupar por intenção é mais útil do que gerar títulos soltos.",
      "A priorização final precisa continuar com o time.",
    ],
    aulasRelacionadas: ["aula-ia-escrita", "aula-produtividade-rotina"],
    templatesRelacionados: ["tpl-copy-marca", "tpl-analise-serie"],
    ferramentasRelacionadas: ["chatgpt", "loft-insights", "n8n"],
    casesRelacionados: ["descricao-anuncios", "previsao-demanda"],
    tags: ["seo", "conteúdo", "pauta", "marketing", "busca"],
  },
  {
    id: "qa-testes",
    nome: "Geração de Casos de Teste",
    descricao:
      "Experimento que transforma critérios de aceite em casos de teste estruturados para o time de qualidade.",
    area: "Engenharia",
    ferramentas: ["ChatGPT", "Lovable"],
    impacto: "Baixo",
    status: "Experimento",
    time: "Engenharia — Qualidade",
    responsaveis: ["Rafael Kondo"],
    acessos: 264,
    novo: true,
    cor: "#cee79e",
    problema:
      "Escrever casos de teste a partir dos critérios de aceite consumia boa parte da sprint e cenários de exceção eram esquecidos.",
    solucao:
      "A história com critérios de aceite vira uma lista de casos positivos, negativos e de borda para curadoria do time.",
    antes: ["Casos escritos do zero", "Cenários de borda esquecidos", "Cobertura irregular"],
    depois: ["Primeira lista automática", "Casos de borda sugeridos", "Curadoria em vez de redação"],
    fluxo: ["Dados", "Automação", "IA", "Processamento", "Resultado"],
    etapas: [
      { titulo: "Padronizar os critérios de aceite", texto: "Formato Dado/Quando/Então melhora muito a saída." },
      {
        titulo: "Gerar os casos",
        texto: "Peça explicitamente casos negativos e de borda.",
        prompt:
          "A partir dos critérios de aceite abaixo, gere casos de teste em três grupos: positivos, negativos e de borda. Formato: título, pré-condição, passos, resultado esperado.",
      },
      { titulo: "Curadoria do time", texto: "Descarte o excesso. Cobertura útil vale mais do que volume." },
    ],
    resultados: [
      { label: "Horas economizadas / ano", valor: "210h" },
      { label: "Casos gerados por história", valor: "14" },
      { label: "Squads no experimento", valor: "3" },
    ],
    aprendizados: [
      "Critério de aceite bem escrito é pré-requisito, não detalhe.",
      "Volume de casos gerados precisa de curadoria firme.",
    ],
    aulasRelacionadas: ["aula-ia-engenharia", "aula-prompt-estruturado"],
    templatesRelacionados: ["tpl-checklist-qualidade", "tpl-code-review"],
    ferramentasRelacionadas: ["chatgpt", "lovable"],
    casesRelacionados: ["revisao-codigo", "base-conhecimento"],
    tags: ["teste", "qa", "qualidade", "engenharia", "critérios"],
  },
];
