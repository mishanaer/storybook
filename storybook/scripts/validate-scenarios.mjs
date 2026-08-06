#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const [rootArg, catalogArg] = process.argv.slice(2);
if (!rootArg || !catalogArg) {
  console.error("Usage: node validate-scenarios.mjs <surface-root> <catalog.json>");
  process.exit(2);
}

const root = path.resolve(rootArg);
const catalog = JSON.parse(await fs.readFile(catalogArg, "utf8"));
const items = (catalog.groups ?? []).flatMap((group) => group.items ?? []).filter((item) => item.kind !== "foundation");
const errors = [];
const styleImport = /(?:import|require)\s*(?:\(|[^"']*?from\s+)?["'][^"']+\.(?:css|scss|sass|less)["']/;
const localVisual = /\b(?:function|class|const|let|var)\s+(?:Fake|Mock|Preview|WindowFrame)[A-Za-z0-9_]*/;
const extensions = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
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
  for (const extension of extensions) if (await exists(`${base}${extension}`)) return `${base}${extension}`;
  for (const extension of extensions.slice(1)) {
    const candidate = path.join(base, `index${extension}`);
    if (await exists(candidate)) return candidate;
  }
  return null;
}

async function resolveSpecifier(specifier, from) {
  if (specifier.startsWith(".")) return resolveFile(path.resolve(path.dirname(from), specifier));
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

for (const item of items) {
  const scenarioPath = path.resolve(root, item.source);
  const rootPath = path.resolve(root, item.productionRoot);
  let source;
  try { source = await fs.readFile(scenarioPath, "utf8"); }
  catch { errors.push(`Scenario file is missing for ${item.id}: ${item.source}`); continue; }
  try { await fs.access(rootPath); }
  catch { errors.push(`Production root is missing for ${item.id}: ${item.productionRoot}`); }
  if (styleImport.test(source)) errors.push(`Scenario ${item.source} imports showcase-only styles.`);
  if (localVisual.test(source)) errors.push(`Scenario ${item.source} defines a fake visual component.`);

  const specifiers = [...source.matchAll(/(?:import\s+(?:[^"']*?\s+from\s+)?|require\s*\()\s*["']([^"']+)["']/g)].map((match) => match[1]);
  const resolvedImports = await Promise.all(specifiers.map((specifier) => resolveSpecifier(specifier, scenarioPath)));
  const direct = resolvedImports.some((resolved) => resolved === rootPath);
  if (!direct) errors.push(`Scenario ${item.source} does not directly import productionRoot ${item.productionRoot}.`);
}

if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Scenarios are production-faithful: ${items.length} checked.`);
