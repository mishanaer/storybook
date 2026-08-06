#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const catalogArg = process.argv[2];
if (!catalogArg) {
  console.error("Usage: node validate-catalog.mjs <catalog.json>");
  process.exit(2);
}

const catalogPath = path.resolve(catalogArg);
const productRoot = path.dirname(catalogPath);
const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));
const errors = [];
const ids = new Set();
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!catalog.title || !Array.isArray(catalog.groups)) {
  errors.push("Catalog must contain a title and a groups array.");
}

for (const group of catalog.groups ?? []) {
  if (!idPattern.test(group.id ?? "")) errors.push(`Invalid group id: ${group.id ?? "<missing>"}`);
  if (!group.title || !Array.isArray(group.items)) errors.push(`Group ${group.id ?? "<missing>"} needs a title and items.`);

  for (const item of group.items ?? []) {
    if (!idPattern.test(item.id ?? "")) errors.push(`Invalid item id: ${item.id ?? "<missing>"}`);
    if (ids.has(item.id)) errors.push(`Duplicate item id: ${item.id}`);
    ids.add(item.id);
    if (!item.title || !item.source) errors.push(`Item ${item.id ?? "<missing>"} needs a title and source.`);

    const source = path.resolve(productRoot, item.source ?? "");
    if (!source.startsWith(`${productRoot}${path.sep}`)) errors.push(`Item ${item.id} points outside the product.`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Catalog is valid: ${ids.size} item(s) in ${catalog.groups.length} group(s).`);
