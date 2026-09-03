# Diferenças de tokens — atual × Copan-Components.fig

Comparação entre os tokens em `colors_and_type.css` (extraídos de Copan-**Foundation**.fig) e o que o arquivo `Copan-Components.fig` realmente usa (extraído de `METADATA.md` + inspeção dos componentes Button, Chips, Tags, Feedback-banner, Tabela de propriedades oficial).

**Regras de leitura:**
- ✅ Bate com o que já temos
- ⚠️ Diferença semântica — rever
- 🔴 Diferença material — precisa trocar
- ➕ Token novo, não tínhamos

---

## 1. Fontes

| Atual (`colors_and_type.css`) | Figma de componentes | Status |
|---|---|---|
| `Inter` (única, variável) | `Helvetica Now Text` Regular — **6175×** (body, inputs, labels) | 🔴 Conflito de narrativa |
| — | `Helvetica Now Text` Bold — **1505×** (labels fortes) | 🔴 |
| — | `Helvetica Now Display` Bold — **1269×** (títulos 24/48px) | 🔴 |
| — | `Inter` Regular — 873× (legendas 11–12px) | ⚠️ Uso secundário |
| — | `Roboto`, `Inter Medium/Bold`, `Itau Display` | ➕ Uso residual (ignorar) |

### Decisão recomendada

O Foundation diz **"apenas a família Inter"** (regra oficial). O arquivo de componentes foi desenhado em Helvetica Now (fontes licenciadas, não distribuídas publicamente). Três caminhos:

- **A. Manter a substituição Inter** (o que fazemos hoje). Pragmatico, funciona offline, combina com a regra do Foundation. ➜ **Recomendado.**
- **B. Adicionar Helvetica Now** se você tem os `.woff2` de produção. Nós incluiríamos o `@font-face`.
- **C. Stack híbrida:** Helvetica Now com fallback Inter, com as URLs CDN que você me fornecer.

**Observação:** `Helvetica Now Display Bold 48/60` é o tamanho dos títulos `h3` no Figma — na nossa CSS atual `--h3` é `32/40`. Isso é uma **discrepância de tamanho real**, não só de fonte. Ver §4.

---

## 2. Paleta — primary / brand

| Token | Atual | Figma | Status |
|---|---|---|---|
| Orange 550 (brand) | `#F56738` | `rgb(245,103,56)` = `#F56738` | ✅ |
| Orange 600 (border/press) | `#D94616` | `rgb(217,70,22)` = `#D94616` | ✅ |
| Orange 500 (soft accent) | `#FF774A` | `rgb(255,119,74)` = `#FF774A` | ✅ |
| Magenta — `rgb(255,0,255)` 3033×, `rgb(243,22,176)` 112× | — | **Layer placeholder do Figma** — ignorar (é cor de debug) | ⚠️ |

---

## 3. Paleta — neutrals

| Token | Atual | Figma | Status |
|---|---|---|---|
| neutral-0 | `#FFFFFF` | `rgb(255,255,255)` 4342× | ✅ |
| neutral-900 | `#121619` | `rgb(18,22,25)` 3707× | ✅ |
| neutral-950 | `#191F23` | `rgb(25,31,35)` 3284× | ✅ |
| neutral-700 | `#697077` | `rgb(105,112,119)` 2316× | ✅ |
| neutral-300 | `#C1C7CD` | `rgb(193,199,205)` 2208× | ✅ |
| info-50 (fundo feedback) | `#EDF6FC` | `rgb(237,246,252)` 818× | ✅ |
| bg-subtle | `#F2F4F8` | `rgb(242,244,248)` 930× | ✅ |
| — (falta) | — | `rgb(195,218,232)` 1084× | ➕ **info-200** ausente do CSS mas usado 1084× |
| — (falta) | — | `rgb(56,123,168)` 708× | ➕ **info-500** (azul-info escuro) |
| — (falta) | — | `rgb(12,140,233)` 327× | ➕ **info-400** (link azul) |
| neutral-600 | `#536470` | `rgb(90,106,117)` = `#5A6A75` 272× | 🔴 **valor diferente** |
| — | — | `rgb(52,58,63)` 194× | ➕ neutral-800 real |
| — | — | `rgb(135,141,150)` 129× | ➕ neutral-500 cinza |
| — | — | `rgb(135,157,172)` 366× | ➕ cinza-azulado dedicado |
| — | — | `rgb(162,169,176)` 575× | ➕ neutral-400 cinza real |
| — | — | `rgb(225,233,239)` 311× | ➕ border-subtle real (próximo do atual `#E1E9EF`) |
| — | — | `rgb(235,235,235)` 476× | ➕ divider stroke |

### Valores atuais que parecem fabricados

- `--copan-neutral-50: #EDF6FC` — mas o #EDF6FC é azul-info, não neutro. O Figma usa `#F2F4F8` como bg-subtle. O atual embaralha isso.
- `--copan-neutral-200: #DDE1E6` e `--copan-neutral-400: #A2A9B0` não aparecem nas 30 cores top. Provavelmente foram extrapolados.

### Decisão recomendada

Reorganizar a escala de neutros em **duas famílias** separadas, como o Figma de fato faz:

```
/* cinzas puros */
neutral-0:   #FFFFFF
neutral-100: #EBEBEB  (stroke)
neutral-200: #C1C7CD  (border)
neutral-300: #A2A9B0  (border-muted)
neutral-400: #878D96  (text-tertiary)
neutral-500: #697077  (text-secondary)
neutral-600: #5A6A75  (text-body)   ← corrigido
neutral-700: #343A3F
neutral-800: #191F23  (surface-deep)
neutral-900: #121619  (text-primary)

/* azul-frio (slate) — diferente dos neutros */
slate-100: #F2F4F8
slate-200: #E1E9EF
slate-300: #C3DAE8  ← novo
slate-400: #879DAC  ← novo
slate-500: #387BA8  ← novo
```

---

## 4. Typography — tamanhos

| Estilo | Atual | Figma (pelas contagens) | Status |
|---|---|---|---|
| Body regular | 16/24 | 16/24 (1852×), 14/? (2690×), 12/? (1405×) | ✅ Bate |
| Headline3 (h3) | 32/40 | **Helvetica Now Display Bold 24/ — 1030×** — é de longe o mais usado | 🔴 **o "título padrão" no Figma é 24px, não 32px** |
| Headline2 (h2) | 48/60 | 48px aparece 193× | ✅ existe |
| Headline1 (h1) | 56/64 | — não aparece | ⚠️ |
| Hero | 64/72 | — não aparece | ⚠️ |
| Overline | 10/16 Bold +8% | `Bold 10px × 330` | ✅ |

### Decisão recomendada

Manter a escala atual (faz sentido para marketing), mas **renomear** a hierarquia para bater com a do produto:

- Seção-título (`24/32 Bold`) → novo token `--text-section`
- Cabeçalho de dialog/modal (`18/28 Bold`) → já existe como `subtitle` ✅
- Hero/Headlines grandes (32+) → reservar para marketing-site, não para produto transacional

---

## 5. Radii / Border

| Token | Atual | Figma | Status |
|---|---|---|---|
| radius-sm (button default) | `8px` | `8px` (confirmado no Button spec) | ✅ |
| radius-md (card) | `12px` | — não vi citação; cards usam 8px no Figma também | ⚠️ |
| radius-pill | `999px` | pill chips ✅ | ✅ |

---

## 6. Component-level deltas (o que o Figma prova)

### Button

| Prop | Atual `components.jsx` | Figma real |
|---|---|---|
| Padding md | `11px 20px` | `12px 24px` 🔴 |
| Font size md | `14px` bold | `16/24 regular` 🔴 |
| Height md | ~40px | `48px` 🔴 |
| Primary border | `1px solid #D94616` | **sem border visível** (fill-only) ⚠️ |
| Secondary | "outline preto" | Versão **outline preta** — hoje nosso `outline` bate ✅ |
| Modifier | `variant: primary/dark/outline/neutral/ghost` | `Variant=primary|secondary` + `Modifier=none|inverted|premium` + `State=enabled|hover|focus|pressed|disabled|loading` 🔴 **API diferente** |

### Chips

- Pill (radius-pill), borda `#C1C7CD`, sem fundo em `enabled`, text preto
- States: `enabled | hover | focus | pressed | disabled | selected`
- `selected` = fundo preto `#121619` texto branco
- Icon pos: `left | right`

### Tags

- Pill, **com fundo colorido** nas variantes semânticas:
  - neutral → cinza claro
  - informativa → azul claro
  - positiva → verde claro
  - atenção → âmbar claro
  - negativa → vermelho claro
- Modificadores: `none | inverted | premium | muted`
- **`muted`** é um variant novo que não temos — label fica cinza-claro, quase invisível

### Feedback banner

- Fundo `#EDF6FC` (info-50) por padrão
- Ícone 24px à esquerda, label no meio, ação opcional (link) + botão "Fechar"
- Variantes provavelmente seguem as cores semânticas (confirmar)

---

## 7. Proposta de atualização

### Opção A — Cirúrgica (recomendado)
Manter estrutura atual, aplicar apenas correções 🔴:
1. Ajustar `neutral-600` para `#5A6A75`
2. Adicionar família **slate** (cinzas azulados) como tokens separados
3. Renomear `--h3` para alertar que é tamanho marketing; criar `--text-section` = 24/32
4. Reescrever `Button` em `components.jsx` para bater com Figma: h=48, fs=16/24, padding 12/24, sem border
5. Adicionar variantes de Chip e Tag que faltam
6. Reescrever cards de preview afetados

### Opção B — Reescrita completa
Apagar `colors_and_type.css` e gerar de novo a partir do Figma de componentes. Risco: quebra o marketing-site existente e o DS terá cara diferente.

### Opção C — Só adicionar, não mexer no que existe
Manter 100% do atual, só adicionar tokens novos (slate, info-200/400/500, text-section, modifiers de Tag/Chip). Menor risco; mas mantém os valores 🔴 errados.

---

## Aguardando sua decisão

Me diga qual opção seguir (A / B / C) antes de continuar. Se tiver dúvida em algum item específico, aponte — posso ir mais fundo numa linha antes de decidir.
