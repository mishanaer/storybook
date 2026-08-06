#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const rootArg = args.find((arg) => !arg.startsWith("--")) ?? ".";
const outIndex = args.indexOf("--out");
const outArg = outIndex >= 0 ? args[outIndex + 1] : null;
const root = path.resolve(rootArg);

const ignored = new Set([
  ".git",
  ".next",
  ".nuxt",
  ".svelte-kit",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "storybook-static",
]);

const componentPattern = /(?:^|\/)(?:components?|ui|primitives?)\/.+\.(?:[jt]sx?|vue|svelte)$/i;
const scenarioPattern = /\.(?:showcase|stories|story)\.(?:[jt]sx?|vue|svelte)$/i;
const stylePattern = /\.(?:css|scss|sass|less)$/i;
const sourcePattern = /\.(?:[cm]?[jt]sx?|vue|svelte|css|scss|sass|less)$/i;

async function walk(directory, files = []) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(absolute, files);
    else if (sourcePattern.test(entry.name)) files.push(absolute);
  }
  return files;
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

async function readPackage() {
  try {
    return JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
  } catch {
    return {};
  }
}

function detectFramework(pkg) {
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
  if (dependencies.next) return "next";
  if (dependencies.nuxt || dependencies.vue) return "vue";
  if (dependencies["@sveltejs/kit"] || dependencies.svelte) return "svelte";
  if (dependencies.react) return dependencies.vite ? "react-vite" : "react";
  return "unknown";
}

const files = await walk(root);
const pkg = await readPackage();
const tokenNames = new Set();
const tokenFiles = [];

for (const file of files.filter((item) => stylePattern.test(item))) {
  const content = await fs.readFile(file, "utf8");
  const matches = [...content.matchAll(/--([a-z0-9-_]+)\s*:/gi)];
  if (matches.length) tokenFiles.push(relative(file));
  for (const match of matches) tokenNames.add(`--${match[1]}`);
}

const inventory = {
  root,
  framework: detectFramework(pkg),
  packageManager: pkg.packageManager ?? null,
  components: files.filter((file) => componentPattern.test(relative(file))).map(relative).sort(),
  scenarios: files.filter((file) => scenarioPattern.test(file)).map(relative).sort(),
  tokens: {
    files: tokenFiles.sort(),
    names: [...tokenNames].sort(),
  },
};

const json = `${JSON.stringify(inventory, null, 2)}\n`;
if (outArg) {
  const output = path.resolve(outArg);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, json);
}
process.stdout.write(json);
