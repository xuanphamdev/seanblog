import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPostsByLang, postUrl } from "../lib/posts";
import { site } from "../lib/site-config";

const LANG = "en" as const;
const MAX_ITEMS = 30;

export async function GET(context: APIContext) {
  const posts = await getPostsByLang(LANG);
  const rssSite = new URL(
    import.meta.env.BASE_URL,
    context.site ?? site.url,
  ).href;

  return rss({
    title: `${site.title} — EN`,
    description: site.description[LANG],
    site: rssSite,
    items: posts.slice(0, MAX_ITEMS).map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.summary,
      link: postUrl(p),
      categories: p.data.tags,
    })),
    customData: `<language>en-US</language>`,
    stylesheet: false,
  });
}
