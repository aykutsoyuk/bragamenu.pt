export type Locale = "en" | "pt";

export type Localized = Record<Locale, string>;

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
};

export type MenuCategory = {
  key: string;
  label: Localized;
  items: MenuItem[];
};

export type Restaurant = {
  slug: string;
  name: string;
  tagline: Localized;
  logo: string | null;
  cover: string | null;
  instagram: string | null;
  whatsapp: string | null;
};
