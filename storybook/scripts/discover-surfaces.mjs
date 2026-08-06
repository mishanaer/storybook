#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const repositoryRoot = path.resolve(process.argv[2] ?? ".");
const ignored = new Set([".git", ".next", ".nuxt", ".svelte-kit", "build", "coverage", "dist", "node_modules"]);
const packageFiles = [];

async function walk(directory, depth = 0) {
  if (depth > 4) return;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(absolute, depth + 1);
    else if (entry.name === "package.json") packageFiles.push(absolute);
  }
}

function detectFramework(pkg) {
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
  if (dependencies.next) return "next";
  if (dependencies.nuxt || dependencies.vue) return "vue";
  if (dependencies["@sveltejs/kit"] || dependencies.svelte) return "svelte";
  if (dependencies.react) return dependencies.vite ? "react-vite" : "react";
  return null;
}

await walk(repositoryRoot);
const surfaces = [];

for (const packageFile of packageFiles.sort()) {
  const pkg = JSON.parse(await fs.readFile(packageFile, "utf8"));
  const framework = detectFramework(pkg);
  const scripts = Object.keys(pkg.scripts ?? {});
  const environments = scripts.filter((name) => /^(?:dev|start|serve|preview)(?::|$)/.test(name));
  if (!framework && environments.length === 0) continue;
  const root = path.dirname(packageFile);
  surfaces.push({
    id: pkg.name ?? path.basename(root),
    root: path.relative(repositoryRoot, root).split(path.sep).join("/") || ".",
    framework: framework ?? "unknown",
    environments,
  });
}

process.stdout.write(`${JSON.stringify({ repositoryRoot, surfaces }, null, 2)}\n`);
