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

export async function fetchMenu(menuUrl: string): Promise<MenuItem[]> {
  if (!menuUrl) throw new Error("MENU_NOT_CONFIGURED");

  const res = await fetch(menuUrl, { next: { revalidate: 300 } });
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
}


