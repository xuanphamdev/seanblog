/**
 * Sitewide constants. Source of truth for metadata, social, locales.
 */

export const LOCALES = ["vi", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "vi";
const siteUrl =
  import.meta.env.PUBLIC_SITE_URL ?? "https://xuanphamdev.github.io/seanblog";

export const site = {
  title: "Seandev",
  tagline: {
    vi: "Ghi chép về công nghệ.",
    en: "Notes on technology.",
  },
  description: {
    vi: "Blog cá nhân về Rust, AI agents, system design và distributed systems.",
    en: "Personal blog on Rust, AI agents, system design and distributed systems.",
  },
  author: "Sean",
  url: siteUrl,
  github: "https://github.com/xuanphamdev/seanblog",
  location: "saigon, vn",
  defaultLocale: DEFAULT_LOCALE,
  locales: LOCALES,
} as const;

/**
 * "Now" — what the author is currently working on.
 * Update freely; appears in the homepage status line.
 */
export const now = {
  current: {
    vi: "viết blog Seandev và build AI agents",
    en: "writing Seandev and building AI agents",
  },
} as const;

/** Hero copy used on the bilingual homepage. */
export const hero = {
  vi: {
    titleA: "Ghi chép về những thứ",
    titleB: "chưa ai từng xây.",
    lede: "Một blog về Rust, AI agents, và những hệ thống ta vẫn loay hoay dựng nên.",
  },
  en: {
    titleA: "Notes on building",
    titleB: "things that don't exist yet.",
    lede: "A blog about Rust, AI agents, and the systems we keep failing to build.",
  },
} as const;

export const ui = {
  nav: {
    posts: { vi: "Bài viết", en: "Posts" },
    tags: { vi: "Thẻ", en: "Tags" },
    about: { vi: "Giới thiệu", en: "About" },
    search: { vi: "Tìm", en: "Search" },
  },
  footer: {
    rss: { vi: "RSS", en: "RSS" },
    github: { vi: "GitHub", en: "GitHub" },
    builtWith: {
      vi: "Xây bằng Astro.",
      en: "Built with Astro.",
    },
  },
  meta: {
    readMin: { vi: "phút đọc", en: "min read" },
    by: { vi: "bởi", en: "by" },
    translatedAvailable: {
      vi: "Có bản tiếng Anh",
      en: "Vietnamese version available",
    },
    noTranslation: {
      vi: "Chưa có bản tiếng Anh",
      en: "No Vietnamese version",
    },
  },
  search: {
    placeholder: { vi: "Tìm bài viết...", en: "Search posts..." },
    empty: { vi: "Không có kết quả.", en: "No results." },
    kbd: "⌘K",
  },
  notFound: {
    headline: { vi: "Lạc đường?", en: "Lost?" },
    body: {
      vi: "Trang này không tồn tại — hoặc đã đi đâu đó. Thử mấy link bên dưới.",
      en: "This page doesn't exist — or wandered off. Try the links below.",
    },
  },
} as const;

export function t<K extends keyof typeof ui>(
  section: K,
  key: keyof (typeof ui)[K],
  locale: Locale,
): string {
  const node = (ui[section] as Record<string, Record<Locale, string>>)[
    key as string
  ];
  return node?.[locale] ?? "";
}
