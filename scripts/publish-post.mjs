#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";

const DEFAULT_SITE_URL = "https://xuanphamdev.github.io/seanblog";
const VALID_LANGS = new Set(["vi", "en"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseArgs(argv) {
  const values = {
    date: new Date().toISOString().slice(0, 10),
    draft: "false",
    repoDir: process.env.SEANBLOG_REPO_DIR ?? process.cwd(),
    siteUrl: process.env.SEANBLOG_SITE_URL ?? DEFAULT_SITE_URL,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const key = arg.slice(2).replace(/-([a-z])/g, (_, char) =>
      char.toUpperCase(),
    );
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      values[key] = "true";
      continue;
    }

    values[key] = next;
    index += 1;
  }

  return values;
}

function requireValue(args, key) {
  const value = args[key];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required --${key}`);
  }

  return value.trim();
}

const slugify = (input) =>
  input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const yamlString = (value) =>
  `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

const run = (command, args, cwd, env = {}) =>
  execFileSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: "inherit",
  });

function readGitConfig(key, repoDir) {
  try {
    return execFileSync("git", ["config", "--get", key], {
      cwd: repoDir,
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

function readBody(args) {
  return args.bodyFile
    ? readFileSync(resolve(args.repoDir, args.bodyFile), "utf8").trim()
    : requireValue(args, "body");
}

function buildPost(args) {
  const lang = requireValue(args, "lang");
  if (!VALID_LANGS.has(lang)) {
    throw new Error("--lang must be vi or en");
  }

  const title = requireValue(args, "title");
  const summary = requireValue(args, "summary");
  const date = requireValue(args, "date");
  if (!DATE_PATTERN.test(date)) {
    throw new Error("--date must use YYYY-MM-DD");
  }

  const slug = args.slug ? slugify(args.slug) : slugify(title);
  if (!slug) {
    throw new Error("Could not create a valid slug");
  }

  const tags = (args.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (tags.length === 0) {
    throw new Error("At least one tag is required via --tags");
  }

  const body = readBody(args);
  if (body.length < 80) {
    throw new Error("Post body is too short");
  }

  const draft = String(args.draft).toLowerCase() === "true";
  const translationKey = args.translationKey?.trim();
  const relativePath = `src/content/posts/${lang}/${date}-${slug}.md`;
  const filePath = resolve(args.repoDir, relativePath);
  const frontmatter = [
    "---",
    `title: ${yamlString(title)}`,
    `date: ${date}`,
    `tags: [${tags.map(yamlString).join(", ")}]`,
    `summary: ${yamlString(summary)}`,
    `draft: ${draft ? "true" : "false"}`,
    ...(translationKey ? [`translationKey: ${yamlString(translationKey)}`] : []),
    "---",
    "",
  ].join("\n");

  return {
    filePath,
    publicUrl: `${args.siteUrl.replace(/\/$/, "")}/${lang}/posts/${slug}/`,
    relativePath,
    slug,
    title,
    markdown: `${frontmatter}${body.trim()}\n`,
  };
}

function ensureGitIdentity(repoDir) {
  const name = readGitConfig("user.name", repoDir);
  const email = readGitConfig("user.email", repoDir);

  if (!name) {
    run("git", ["config", "user.name", "OpenClaw Blog Bot"], repoDir);
  }
  if (!email) {
    run("git", ["config", "user.email", "bot@seandev.local"], repoDir);
  }
}

function buildDeployEnv(siteUrl) {
  const url = new URL(siteUrl);
  const base = url.pathname.replace(/\/$/, "");

  return {
    DEPLOY_TARGET: "github-pages",
    PUBLIC_SITE_URL: `${url.origin}${base}`,
    SITE_BASE: base,
    SITE_URL: url.origin,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoDir = resolve(args.repoDir);
  const post = buildPost({ ...args, repoDir });

  run("git", ["fetch", "origin", "main"], repoDir);
  run("git", ["checkout", "main"], repoDir);
  run("git", ["pull", "--ff-only", "origin", "main"], repoDir);

  if (existsSync(post.filePath) && args.force !== "true") {
    throw new Error(`Post already exists: ${post.relativePath}`);
  }

  mkdirSync(dirname(post.filePath), { recursive: true });
  writeFileSync(post.filePath, post.markdown, "utf8");

  const deployEnv = buildDeployEnv(args.siteUrl);
  run("npm", ["run", "check"], repoDir, deployEnv);
  run("npm", ["run", "build"], repoDir, deployEnv);

  ensureGitIdentity(repoDir);
  run("git", ["add", post.relativePath], repoDir);
  run("git", ["commit", "-m", `feat(blog): publish ${post.slug}`], repoDir);
  run("git", ["push", "origin", "main"], repoDir);

  const result = {
    ok: true,
    title: post.title,
    file: post.relativePath,
    url: post.publicUrl,
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`publish-post failed: ${message}\n`);
  process.exit(1);
}
