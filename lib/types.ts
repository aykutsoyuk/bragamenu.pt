export type Locale = "en" | "pt";

export type Localized = { en: string; pt: string; };

export type MenuItem = {
  id: string;
  category: Localized;
  categoryKey: string;
  title: Localized;
  description: Localized;
  price: string;
  image: string | null;
  vegan: boolean;
  vegetarian: boolean;
  spicy: boolean;
  available: boolean;
  calories?: string;
  allergens?: Localized;
  winePairing?: Localized;
  dessertPairing?: Localized;
};

export type MenuCategory = {
  key: string;
  label: Localized;
  items: MenuItem[];
};

/** Branding-only shape — safe to pass to client components. */
export type Restaurant = {
  slug: string;
  name: string;
  tagline: Localized;
  logo: string | null;
  cover: string | null;
  instagram: string | null;
  whatsapp: string | null;
};

/** Full restaurant record including operational fields — never pass to client components. */
export type RestaurantRecord = Restaurant & {
  menuUrl: string;     // MENU_URL_<SLUG> env var
  sheetId: string;     // SHEET_ID_<SLUG> env var
  dashboardKey: string; // DASHBOARD_KEY_<SLUG> env var
  notificationEmail?: string;
  phone?: string;
  language?: Locale;
  timezone?: string;
};
