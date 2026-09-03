import {
  ArrowRightOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Collapse, Input } from "antd";
import { createFileRoute, Link } from "@tanstack/react-router";

import { colors } from "@/theme/tokens";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AIOPS App Model — Loft | Inteligência Artificial em um só lugar" },
      {
        name: "description",
        content:
          "Portal interno de IA da Loft: descubra cases, ferramentas, impacto e governança de acesso.",
      },
      { property: "og:title", content: "AIOPS App Model — Loft" },
      {
        property: "og:description",
        content: "Descubra, aprenda e construa com IA na Loft.",
      },
    ],
  }),
  component: LandingPage,
});

const HERO_GREEN = "oklch(0.40 0.10 162)";

const recursos = [
  {
    icon: CompassOutlined,
    titulo: "Projetos de IA",
    desc: "Cases em produção, piloto e experimento com responsáveis e status claros.",
  },
  {
    icon: BarChartOutlined,
    titulo: "Impacto mensurável",
    desc: "Acompanhe métricas e resultados das iniciativas de inteligência artificial.",
  },
  {
    icon: TeamOutlined,
    titulo: "Colaboração entre times",
    desc: "Mapa de áreas, integrações e quem está tocando cada frente.",
  },
  {
    icon: SafetyCertificateOutlined,
    titulo: "Acesso seguro",
    desc: "Controle de identidade, grupos e permissões para o conteúdo certo.",
  },
];

const beneficios = [
  "Centralize o conhecimento de IA da empresa",
  "Reduza o tempo para encontrar cases e integrações",
  "Dê visibilidade a times e resultados",
  "Gerencie quem pode editar e publicar conteúdo",
];

const faqs = [
  {
    key: "1",
    label: "O que é o AIOPS App Model?",
    children:
      "É o portal interno da Loft para descobrir, aprender e acompanhar tudo que envolve Inteligência Artificial — projetos, mapa de atuação, ferramentas e impacto.",
  },
  {
    key: "2",
    label: "Quem pode acessar?",
    children:
      "Colaboradores com conta autorizada. Faça login com e-mail ou usuário corporativo. Convites podem ser enviados por administradores.",
  },
  {
    key: "3",
    label: "Como solicitar acesso?",
    children:
      "Fale com o time de AIOPS ou use o formulário de contato abaixo. Um administrador pode enviar um convite por e-mail.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-[color-mix(in_oklab,var(--muted)_60%,var(--background))] font-[Inter,Arial,sans-serif] text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
              L
            </span>
            <span className="text-sm font-semibold tracking-tight">AIOPS App Model</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button type="default">Entrar</Button>
            </Link>
            <Link to="/login">
              <Button type="primary">Acessar portal</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="px-6 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <div
            className="relative overflow-hidden rounded-2xl border border-border p-8 md:p-12"
            style={{ background: HERO_GREEN, color: "oklch(0.98 0.005 160)" }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 18% 20%, oklch(1 0 0 / 0.18) 0, transparent 45%), radial-gradient(circle at 88% 75%, oklch(1 0 0 / 0.12) 0, transparent 40%)",
              }}
              aria-hidden
            />
            <div className="relative max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur">
                <ThunderboltOutlined className="text-xs" />
                Loft · Inteligência Artificial
              </span>
              <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight md:text-5xl">
                AIOPS App Model
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/85 md:text-lg">
                Descubra cases, acompanhe impacto e construa com IA — tudo em um portal interno
                seguro e organizado.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/login">
                  <Button type="primary" size="large" icon={<ArrowRightOutlined />}>
                    Entrar no portal
                  </Button>
                </Link>
                <a href="#recursos">
                  <Button
                    size="large"
                    ghost
                    className="!border-white/30 !text-white hover:!border-white/50 hover:!bg-white/15 hover:!text-white"
                  >
                    Ver recursos
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="px-6 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-sm font-semibold">Recursos</h2>
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
            Tudo o que os times precisam para navegar o ecossistema de IA da Loft.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recursos.map((r) => (
              <article
                key={r.titulo}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-full text-lg"
                  style={{ background: "rgba(255,119,74,0.12)", color: colors.primary }}
                >
                  <r.icon />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold">{r.titulo}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{r.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2 lg:items-stretch">
          <article className="rounded-xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-sm font-semibold">Benefícios</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Menos dispersão, mais clareza sobre o que a IA já entrega na Loft.
            </p>
            <ul className="mt-6 space-y-3">
              {beneficios.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm">
                  <CheckCircleOutlined style={{ color: colors.primary, marginTop: 2 }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </article>
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-border bg-card text-[13px] text-muted-foreground"
              >
                Screenshot {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <QuestionCircleOutlined style={{ color: colors.primary }} />
            <h2 className="text-sm font-semibold">Perguntas frequentes</h2>
          </div>
          <Collapse items={faqs} bordered={false} className="bg-transparent" />
        </div>
      </section>

      <section id="contato" className="px-6 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-6 text-center md:p-8">
          <h2 className="text-sm font-semibold">Contato</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Dúvidas sobre acesso ou conteúdo? Deixe seu e-mail e entraremos em contato.
          </p>
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <Input type="email" required placeholder="seu.email@loft.com.br" size="large" className="flex-1" />
            <Button type="primary" htmlType="submit" size="large">
              Enviar
            </Button>
          </form>
        </div>
      </section>

      <footer className="border-t border-border bg-card px-6 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
              L
            </span>
            <span className="text-sm font-medium">AIOPS App Model</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-primary">
              Entrar
            </Link>
            <a href="#recursos" className="hover:text-primary">
              Recursos
            </a>
            <a href="#contato" className="hover:text-primary">
              Contato
            </a>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Loft. Uso interno.</p>
        </div>
      </footer>
    </div>
  );
}
