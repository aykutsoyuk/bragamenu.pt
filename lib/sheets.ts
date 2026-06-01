import fs from "node:fs";
import path from "node:path";
import type { MenuCategory, MenuItem } from "./types";

const IMG_EXTS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

// If a sheet says "/casa_braga/chicken_broth.jpg" but the file on disk is
// actually .jpeg/.png, swap the extension for whichever file exists.
// Only touches relative paths (Drive/CDN URLs pass through unchanged).
function resolveLocalImage(rel: string): string {
  if (!rel.startsWith("/")) return rel;
  const publicDir = path.join(process.cwd(), "public");
  const fullAsIs = path.join(publicDir, rel);
  if (fs.existsSync(fullAsIs)) return rel;

  const dot = rel.lastIndexOf(".");
  const base = dot > rel.lastIndexOf("/") ? rel.slice(0, dot) : rel;
  for (const ext of IMG_EXTS) {
    if (fs.existsSync(path.join(publicDir, `${base}.${ext}`))) {
      return `${base}.${ext}`;
    }
  }
  return rel;
}

type Raw = Record<string, unknown>;

function str(row: Raw, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return "";
}

function bool(row: Raw, ...keys: string[]): boolean {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "boolean") return v;
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      if (["true", "yes", "y", "1", "sim", "x"].includes(s)) return true;
      if (["false", "no", "n", "0", "não", "nao", ""].includes(s)) return false;
    }
    if (typeof v === "number") return v !== 0;
  }
  return false;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeImage(url: string): string | null {
  // Strip surrounding quotes/whitespace — sheet cells sometimes arrive as `"/path"`.
  const cleaned = url.trim().replace(/^["'](.*)["']$/, "$1").trim();
  if (!cleaned) return null;
  // Google Drive share links → direct image
  const driveMatch = cleaned.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return resolveLocalImage(cleaned);
}

function normalizeRow(row: Raw, index: number): MenuItem | null {
  const titleEn = str(row, "title", "title_en", "name", "name_en");
  if (!titleEn) return null;

  const titlePt = str(row, "title_pt", "name_pt") || titleEn;
  const descEn = str(row, "description", "description_en", "desc", "desc_en");
  const descPt = str(row, "description_pt", "desc_pt") || descEn;
  const categoryEn = str(row, "category", "category_en") || "Menu";
  const categoryPt = str(row, "category_pt") || categoryEn;
  const price = str(row, "price");
  const image = normalizeImage(str(row, "image", "photo", "img"));

  const availableField = row["available"] ?? row["unavailable"];
  let available = true;
  if (availableField !== undefined) {
    if ("unavailable" in row) {
      available = !bool(row, "unavailable");
    } else {
      available = bool(row, "available");
    }
  }

  return {
    id: `${slugify(categoryEn)}-${slugify(titleEn)}-${index}`,
    category: { en: categoryEn, pt: categoryPt },
    categoryKey: slugify(categoryEn),
    title: { en: titleEn, pt: titlePt },
    description: { en: descEn, pt: descPt },
    price,
    image,
    vegan: bool(row, "vegan"),
    vegetarian: bool(row, "vegetarian"),
    spicy: bool(row, "spicy"),
    available,
  };
}

export function groupByCategory(items: MenuItem[]): MenuCategory[] {
  const map = new Map<string, MenuCategory>();
  for (const item of items) {
    const existing = map.get(item.categoryKey);
    if (existing) {
      existing.items.push(item);
    } else {
      map.set(item.categoryKey, {
        key: item.categoryKey,
        label: item.category,
        items: [item],
      });
    }
  }
  return Array.from(map.values());
}

export async function fetchMenu(): Promise<MenuItem[]> {
  const url = process.env.SHEETS_URL;
  if (!url) {
    return demoMenu();
  }

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Sheets request failed: ${res.status}`);
    const data = (await res.json()) as Raw[] | { rows?: Raw[]; data?: Raw[] };
    const rows = Array.isArray(data)
      ? data
      : Array.isArray(data.rows)
        ? data.rows
        : Array.isArray(data.data)
          ? data.data
          : [];
    return rows
      .map((row, i) => normalizeRow(row, i))
      .filter((x): x is MenuItem => x !== null);
  } catch {
    return demoMenu();
  }
}

// Fallback demo data so the app renders out of the box without a sheet.
function demoMenu(): MenuItem[] {
  const rows: Raw[] = [
    {
      category: "Starters",
      category_pt: "Entradas",
      title: "Pão de Alho",
      title_pt: "Pão de Alho",
      description: "Toasted sourdough, roasted garlic butter, sea salt.",
      description_pt: "Pão rústico tostado, manteiga de alho assado, flor de sal.",
      price: "4.50",
      vegetarian: true,
      image: "https://images.unsplash.com/photo-1573821663912-6df460f9c684?w=800",
    },
    {
      category: "Starters",
      category_pt: "Entradas",
      title: "Bolinhos de Bacalhau",
      title_pt: "Bolinhos de Bacalhau",
      description: "Crisp salt-cod fritters, lemon aioli.",
      description_pt: "Pataniscas de bacalhau crocantes, maionese de limão.",
      price: "7.90",
      image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800",
    },
    {
      category: "Mains",
      category_pt: "Pratos Principais",
      title: "Polvo à Lagareiro",
      title_pt: "Polvo à Lagareiro",
      description: "Slow-roasted octopus, smashed potatoes, olive oil.",
      description_pt: "Polvo assado lentamente, batata a murro, azeite virgem.",
      price: "22.00",
      image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800",
    },
    {
      category: "Mains",
      category_pt: "Pratos Principais",
      title: "Francesinha",
      title_pt: "Francesinha",
      description: "Layered sandwich, cured meats, spiced beer sauce.",
      description_pt: "Sanduíche em camadas, enchidos, molho de cerveja picante.",
      price: "14.50",
      spicy: true,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    },
    {
      category: "Mains",
      category_pt: "Pratos Principais",
      title: "Risoto de Cogumelos",
      title_pt: "Risoto de Cogumelos",
      description: "Wild mushroom risotto, aged parmesan, truffle oil.",
      description_pt: "Risoto de cogumelos silvestres, parmesão curado, azeite de trufa.",
      price: "16.00",
      vegetarian: true,
      image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800",
    },
    {
      category: "Desserts",
      category_pt: "Sobremesas",
      title: "Pastel de Nata",
      title_pt: "Pastel de Nata",
      description: "Warm custard tart, cinnamon, flaky pastry.",
      description_pt: "Pastel de nata morno, canela, massa folhada.",
      price: "2.50",
      vegetarian: true,
      image: "https://images.unsplash.com/photo-1577003833619-76bbd7f82948?w=800",
    },
    {
      category: "Desserts",
      category_pt: "Sobremesas",
      title: "Sericaia com Ameixas",
      title_pt: "Sericaia com Ameixas",
      description: "Cinnamon-scented egg pudding, Elvas plums.",
      description_pt: "Pudim de ovos com canela, ameixas de Elvas.",
      price: "5.50",
      vegetarian: true,
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800",
    },
    {
      category: "Drinks",
      category_pt: "Bebidas",
      title: "Vinho Verde",
      title_pt: "Vinho Verde",
      description: "Crisp, lightly sparkling white wine. Glass.",
      description_pt: "Vinho branco fresco e levemente espumante. Copo.",
      price: "4.00",
      vegan: true,
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
    },
    {
      category: "Drinks",
      category_pt: "Bebidas",
      title: "Galão",
      title_pt: "Galão",
      description: "Tall glass of espresso with steamed milk.",
      description_pt: "Café com leite servido em copo alto.",
      price: "2.20",
      vegetarian: true,
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
    },
  ];
  return rows
    .map((r, i) => normalizeRow(r, i))
    .filter((x): x is MenuItem => x !== null);
}

