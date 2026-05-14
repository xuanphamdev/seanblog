import { getCollection } from "astro:content";
import { getPostLocale, type Post } from "./posts";
import type { Locale } from "./site-config";

export interface TagInfo {
  raw: string;
  slug: string;
  count: number;
}

/** lowercase + remove vietnamese diacritics + kebab. */
export function slugifyTag(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Aggregate all tags for a given locale.
 * Sorted: count desc, then alphabetically.
 */
export async function getAllTags(lang: Locale): Promise<TagInfo[]> {
  const all = await getCollection("posts");
  const map = new Map<string, TagInfo>();
  for (const p of all) {
    if (p.data.draft) continue;
    if (getPostLocale(p) !== lang) continue;
    for (const raw of p.data.tags) {
      const slug = slugifyTag(raw);
      const existing = map.get(slug);
      if (existing) existing.count += 1;
      else map.set(slug, { raw: raw.toLowerCase(), slug, count: 1 });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => b.count - a.count || a.slug.localeCompare(b.slug),
  );
}

/** Get posts matching a tag slug for a locale. */
export async function getPostsByTag(
  lang: Locale,
  tagSlug: string,
): Promise<Post[]> {
  const all = await getCollection("posts");
  return all
    .filter((p) => !p.data.draft)
    .filter((p) => getPostLocale(p) === lang)
    .filter((p) => p.data.tags.some((t) => slugifyTag(t) === tagSlug))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
