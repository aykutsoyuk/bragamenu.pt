import type { Restaurant } from "./types";

// Lightweight restaurant registry. Add new restaurants here.
// In a future iteration this could move to the same Google Sheet.
const restaurants: Record<string, Restaurant> = {
  braga: {
    slug: "braga",
    name: "Casa de Braga",
    tagline: {
      en: "Northern Portuguese kitchen, by the river.",
      pt: "Cozinha do Norte de Portugal, à beira-rio.",
    },
    logo: null,
    cover:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80",
    instagram: "https://instagram.com/casadebraga",
    whatsapp: "https://wa.me/351912",
  },
};

export function getRestaurant(slug: string): Restaurant {
  return (
    restaurants[slug] ?? {
      slug,
      name: slug
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" "),
      tagline: {
        en: "A taste of Portugal, one bite at a time.",
        pt: "Um sabor de Portugal, dentada a dentada.",
      },
      logo: null,
      cover:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80",
      instagram: null,
      whatsapp: null,
    }
  );
}

export const defaultRestaurantSlug = "braga";
