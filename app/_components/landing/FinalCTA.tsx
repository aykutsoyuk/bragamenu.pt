import type { Lang } from "./LandingShell";

const T = {
  en: {
    h2: "Ready to go digital?",
    sub: "First 7 days free. No credit card. Setup in 72 hours. We help you through every step.",
    contact: "Get in touch",
    tagline: "Digital menus & reservations for restaurants.",
    built: "🏠 Built in Braga, Portugal.",
    demo: "Live Demo",
    rights: "All rights reserved.",
  },
  pt: {
    h2: "Pronto para ir digital?",
    sub: "Primeiros 7 dias grátis. Sem cartão de crédito. Configuração em 72 horas. Ajudamos em cada passo.",
    contact: "Fale connosco",
    tagline: "Menus digitais e reservas para restaurantes.",
    built: "🏠 Criado em Braga, Portugal.",
    demo: "Demo ao Vivo",
    rights: "Todos os direitos reservados.",
  },
};

export default function FinalCTA({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <>
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-base font-semibold text-foreground">MenuQR</p>
            <p className="mt-1 text-sm text-muted">{t.tagline}</p>
            <p className="mt-1 text-sm text-muted">{t.built}</p>
          </div>
          <div className="flex gap-6 text-sm text-muted">
            {/* <a href="mailto:hello@menuqr.pt" className="hover:text-foreground">Email</a> */}
            <a href="/casa-de-braga" className="hover:text-foreground">{t.demo}</a>
            <a href="#contact" className="hover:text-foreground">{t.contact}</a>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted/50">
          © {new Date().getFullYear()} MenuQR. {t.rights}
        </p>
      </footer>
    </>
  );
}
