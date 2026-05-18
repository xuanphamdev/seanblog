// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const siteUrl = process.env.SITE_URL ?? "https://xuanphamdev.github.io";
const siteBase =
  process.env.SITE_BASE ??
  (process.env.DEPLOY_TARGET === "github-pages" ? "/seanblog" : undefined);

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  ...(siteBase ? { base: siteBase } : {}),
  trailingSlash: "always",
  prefetch: {
    defaultStrategy: "viewport",
  },
  i18n: {
    defaultLocale: "vi",
    locales: ["vi", "en"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    expressiveCode({
      themes: ["github-dark", "github-light"],
      themeCssSelector: (theme) => `[data-theme='${theme.name === "github-dark" ? "dark" : "light"}']`,
      styleOverrides: {
        borderRadius: "var(--radius-md)",
        codeFontFamily: "var(--font-mono)",
        codeFontSize: "var(--text-sm)",
        uiFontFamily: "var(--font-mono)",
        frames: {
          shadowColor: "transparent",
        },
      },
      defaultProps: {
        wrap: true,
      },
    }),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: "vi",
        locales: { vi: "vi-VN", en: "en-US" },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["heading-link"],
            ariaLabel: "Permalink to this section",
          },
        },
      ],
    ],
  },
});
