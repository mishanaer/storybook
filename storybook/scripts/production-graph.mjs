#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const rootArg = args[0] && !args[0].startsWith("--") ? args[0] : ".";
const entryIndex = args.indexOf("--entry");
const outIndex = args.indexOf("--out");
const entryArg = entryIndex >= 0 ? args[entryIndex + 1] : null;
const outArg = outIndex >= 0 ? args[outIndex + 1] : null;
if (!entryArg) {
  console.error("Usage: node production-graph.mjs <surface-root> --entry <production-entry> [--out <graph.json>]");
  process.exit(2);
}

const root = path.resolve(rootArg);
const extensions = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".css", ".scss", ".sass", ".less", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".woff", ".woff2", ".ttf", ".otf", ".mp3", ".wav"];
const normalize = (file) => path.relative(root, file).split(path.sep).join("/");
const exists = async (file) => fs.stat(file).then((stat) => stat.isFile()).catch(() => false);

async function readAliases() {
  for (const name of ["tsconfig.json", "jsconfig.json"]) {
    try {
      const raw = await fs.readFile(path.join(root, name), "utf8");
      const clean = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/,\s*([}\]])/g, "$1");
      const config = JSON.parse(clean);
      const base = path.resolve(root, config.compilerOptions?.baseUrl ?? ".");
      return Object.entries(config.compilerOptions?.paths ?? {}).map(([key, values]) => ({ key, values, base }));
    } catch {}
  }
  return [];
}

const aliases = await readAliases();
async function resolveFile(base) {
  for (const extension of extensions) {
    const candidate = `${base}${extension}`;
    if (await exists(candidate)) return candidate;
  }
  for (const extension of extensions.slice(1)) {
    const candidate = path.join(base, `index${extension}`);
    if (await exists(candidate)) return candidate;
  }
  return null;
}

async function resolveSpecifier(specifier, from) {
  specifier = specifier.replace(/[?#].*$/, "");
  if (specifier.startsWith(".")) return resolveFile(path.resolve(path.dirname(from), specifier));
  if (specifier.startsWith("/")) return resolveFile(path.resolve(root, `.${specifier}`));
  for (const alias of aliases) {
    const star = alias.key.indexOf("*");
    const prefix = star >= 0 ? alias.key.slice(0, star) : alias.key;
    const suffix = star >= 0 ? alias.key.slice(star + 1) : "";
    if (!specifier.startsWith(prefix) || !specifier.endsWith(suffix)) continue;
    const capture = specifier.slice(prefix.length, specifier.length - suffix.length);
    for (const target of alias.values) {
      const resolved = await resolveFile(path.resolve(alias.base, target.replace("*", capture)));
      if (resolved) return resolved;
    }
  }
  return null;
}

const entry = await resolveFile(path.resolve(root, entryArg));
if (!entry) throw new Error(`Production entry not found: ${entryArg}`);
const queue = [entry];
const visited = new Set();
const edges = [];
const unresolved = [];
const importPattern = /(?:import\s+(?:[^"']*?\s+from\s+)?|export\s+[^"']*?\s+from\s+|import\s*\(|require\s*\()\s*["']([^"']+)["']/g;

while (queue.length) {
  const file = queue.shift();
  if (visited.has(file)) continue;
  visited.add(file);
  if (!/\.(?:[cm]?[jt]sx?)$/.test(file)) continue;
  const source = await fs.readFile(file, "utf8");
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1];
    const local = specifier.startsWith(".") || specifier.startsWith("/") || aliases.some(({ key }) => specifier.startsWith(key.split("*")[0]));
    if (!local) continue;
    const target = await resolveSpecifier(specifier, file);
    if (!target || !target.startsWith(`${root}${path.sep}`)) {
      unresolved.push({ from: normalize(file), specifier });
      continue;
    }
    edges.push({ from: normalize(file), to: normalize(target) });
    queue.push(target);
  }
}

const graph = { root, entry: normalize(entry), nodes: [...visited].map(normalize).sort(), edges, unresolved };
const json = `${JSON.stringify(graph, null, 2)}\n`;
if (outArg) await fs.writeFile(path.resolve(outArg), json);
process.stdout.write(json);
