import { getCollection } from "astro:content";
import { getPostLocale, type Post } from "./posts";
import type { Locale } from "./site-config";

/**
 * Find the translated counterpart of a post in the other locale.
 * Posts are linked via the optional `translationKey` frontmatter field.
 * Returns undefined if no counterpart exists.
 */
export async function getTranslation(
  post: Post,
  targetLang: Locale,
): Promise<Post | undefined> {
  if (!post.data.translationKey) return undefined;
  const all = await getCollection("posts");
  return all.find(
    (p) =>
      getPostLocale(p) === targetLang &&
      p.data.translationKey === post.data.translationKey &&
      !p.data.draft,
  );
}
