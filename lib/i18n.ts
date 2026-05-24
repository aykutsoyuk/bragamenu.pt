import type { Locale } from "./types";

export const LOCALES: Locale[] = ["en", "pt"];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  pt: "Português",
};

export const dict = {
  en: {
    tagline: "A taste of Portugal, one bite at a time.",
    chooseLanguage: "Choose your language",
    goToMenu: "View menu",
    menu: "Menu",
    follow: "Follow",
    contact: "Contact",
    badgeVegan: "Vegan",
    badgeVegetarian: "Vegetarian",
    badgeSpicy: "Spicy",
    badgeUnavailable: "Unavailable",
    empty: "No items in this category yet.",
    loadError: "We couldn't load the menu right now.",
    poweredBy: "Digital menu",
  },
  pt: {
    tagline: "Um sabor de Portugal, dentada a dentada.",
    chooseLanguage: "Escolha o seu idioma",
    goToMenu: "Ver menu",
    menu: "Menu",
    follow: "Seguir",
    contact: "Contacto",
    badgeVegan: "Vegano",
    badgeVegetarian: "Vegetariano",
    badgeSpicy: "Picante",
    badgeUnavailable: "Indisponível",
    empty: "Ainda não há pratos nesta categoria.",
    loadError: "Não foi possível carregar o menu.",
    poweredBy: "Menu digital",
  },
} satisfies Record<Locale, Record<string, string>>;

export type DictKey = keyof typeof dict.en;

export function t(locale: Locale, key: DictKey): string {
  return dict[locale][key] ?? dict.en[key];
}
