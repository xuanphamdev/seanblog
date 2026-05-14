import type { APIContext } from "astro";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
// @ts-ignore — wawoff2 has no bundled types
import wawoff from "wawoff2";
import { getCollection } from "astro:content";
import { getPostLocale, getPostSlug } from "../../../lib/posts";
import { site, type Locale } from "../../../lib/site-config";

const WIDTH = 1200;
const HEIGHT = 630;

export async function getStaticPaths() {
  const all = await getCollection("posts");
  return all
    .filter((p) => !p.data.draft)
    .map((post) => ({
      params: { lang: getPostLocale(post), slug: getPostSlug(post) },
      props: {
        title: post.data.title,
        date: post.data.date.toISOString().slice(0, 10),
        tags: post.data.tags,
      },
    }));
}

interface Props { title: string; date: string; tags: string[]; }

// Module-level font cache — decompression is the slow part, do it once.
const fontCache = new Map<string, ArrayBuffer>();

async function loadFontFromWoff2(file: string): Promise<ArrayBuffer> {
  if (fontCache.has(file)) return fontCache.get(file)!;
  const p = resolve(process.cwd(), "node_modules", file);
  const woff2 = await readFile(p);
  const ttf: Uint8Array = await wawoff.decompress(woff2);
  const ab = ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength) as ArrayBuffer;
  fontCache.set(file, ab);
  return ab;
}

const TEMPLATE = (props: Props & { lang: Locale }) => ({
  type: "div",
  props: {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      backgroundColor: "#0d0f12",
      color: "#e9eaeb",
      padding: "72px 80px",
      fontFamily: "Fraunces",
      position: "relative",
    },
    children: [
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#8a8d92",
            fontFamily: "Mono",
            letterSpacing: 1.5,
            textTransform: "uppercase",
          },
          children: [
            { type: "div", props: { children: `${site.title.toLowerCase()}.dev` } },
            { type: "div", props: { children: `/${props.lang}` } },
          ],
        },
      },
      {
        type: "div",
        props: {
          style: { display: "flex", flexDirection: "column", maxWidth: 1000 },
          children: [
            {
              type: "div",
              props: {
                style: {
                  fontSize: 72,
                  lineHeight: 1.05,
                  letterSpacing: -1.5,
                  fontWeight: 600,
                  color: "#f1f2f3",
                },
                children: props.title,
              },
            },
          ],
        },
      },
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#a4a7ac",
            fontFamily: "Mono",
          },
          children: [
            {
              type: "div",
              props: {
                style: { display: "flex", gap: 12 },
                children: [
                  { type: "div", props: { children: props.date } },
                  { type: "div", props: { children: "·" } },
                  {
                    type: "div",
                    props: {
                      children:
                        props.tags.length > 0
                          ? props.tags.slice(0, 3).map((t) => `#${t}`).join("  ")
                          : "",
                    },
                  },
                ],
              },
            },
            {
              type: "div",
              props: {
                style: {
                  width: 14,
                  height: 14,
                  backgroundColor: "#48b3c3",
                  borderRadius: 9999,
                },
              },
            },
          ],
        },
      },
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            top: 0,
            right: 0,
            width: 4,
            height: "100%",
            backgroundColor: "#48b3c3",
            opacity: 0.6,
          },
        },
      },
    ],
  },
});

export async function GET(context: APIContext) {
  const { lang } = context.params as { lang: Locale; slug: string };
  const props = context.props as Props;

  const [fraunces, frauncesVi, mono] = await Promise.all([
    loadFontFromWoff2("@fontsource/fraunces/files/fraunces-latin-600-normal.woff2"),
    loadFontFromWoff2("@fontsource/fraunces/files/fraunces-vietnamese-600-normal.woff2"),
    loadFontFromWoff2("@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2"),
  ]);

  const svg = await satori(TEMPLATE({ ...props, lang }), {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: "Fraunces", data: fraunces, weight: 600, style: "normal" },
      { name: "Fraunces", data: frauncesVi, weight: 600, style: "normal" },
      { name: "Mono", data: mono, weight: 400, style: "normal" },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
    .render()
    .asPng();
  const pngBody = png.buffer.slice(
    png.byteOffset,
    png.byteOffset + png.byteLength,
  ) as ArrayBuffer;

  return new Response(pngBody, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
