import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "./site-config";

export type Post = CollectionEntry<"posts">;

/**
 * Returns the locale segment from a post id.
 * Post files live at `{lang}/{slug}.md`, so id starts with `vi/` or `en/`.
 */
export function getPostLocale(post: Post): Locale {
  return post.id.startsWith("en/") ? "en" : "vi";
}

/** Slug part of the id (no leading lang prefix). */
export function getPostSlug(post: Post): string {
  return post.id.replace(/^(vi|en)\//, "");
}

/**
 * Get all published posts for a given locale, sorted newest first.
 */
export async function getPostsByLang(lang: Locale): Promise<Post[]> {
  const all = await getCollection("posts");
  return all
    .filter((p) => getPostLocale(p) === lang && !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Get a post by lang + slug, or undefined. */
export async function getPostBySlug(
  lang: Locale,
  slug: string,
): Promise<Post | undefined> {
  const all = await getCollection("posts");
  return all.find(
    (p) => getPostLocale(p) === lang && getPostSlug(p) === slug,
  );
}

/** Build the canonical URL path for a post. */
export function postUrl(post: Post): string {
  return `/${getPostLocale(post)}/posts/${getPostSlug(post)}/`;
}
