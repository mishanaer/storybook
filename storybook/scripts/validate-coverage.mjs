#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const [inventoryArg, catalogArg] = process.argv.slice(2);
if (!inventoryArg || !catalogArg) {
  console.error("Usage: node validate-coverage.mjs <inventory.json> <catalog.json>");
  process.exit(2);
}

const inventoryPath = path.resolve(inventoryArg);
const catalogPath = path.resolve(catalogArg);
const inventory = JSON.parse(await fs.readFile(inventoryPath, "utf8"));
const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));
const normalize = (value) => value?.replaceAll("\\", "/").replace(/^\.\//, "");

const baselineComponents = (inventory.components ?? [])
  .map(normalize)
  .filter((source) => source && !/\.showcase\.[cm]?[jt]sx?$/.test(source));
const items = (catalog.groups ?? []).flatMap((group) => group.items ?? []);
const covered = new Set(items.map((item) => normalize(item.componentSource)).filter(Boolean));
const excluded = new Map(
  (catalog.exclusions ?? []).map((entry) => [normalize(entry.source), entry.reason?.trim()])
);
const errors = [];

if (!inventory.scope?.id || !catalog.scope?.id) {
  errors.push("Inventory and catalog must declare source scope.");
} else {
  if (inventory.scope.id !== catalog.scope.id) {
    errors.push(`Source scope mismatch: inventory=${inventory.scope.id}, catalog=${catalog.scope.id}`);
  }
  if ((inventory.scope.environment ?? null) !== (catalog.scope.environment ?? null)) {
    errors.push(
      `Source environment mismatch: inventory=${inventory.scope.environment ?? "<none>"}, catalog=${catalog.scope.environment ?? "<none>"}`
    );
  }
}

for (const source of baselineComponents) {
  if (!covered.has(source) && !excluded.get(source)) errors.push(`Uncovered component: ${source}`);
}

const productItems = items.filter((item) => item.kind === "product");
if (baselineComponents.length >= 5 && productItems.length === 0) {
  errors.push("Catalog has no product components. Primitive-only coverage is incomplete.");
}

for (const source of covered) {
  if (!baselineComponents.includes(source)) errors.push(`componentSource is absent from baseline inventory: ${source}`);
}

for (const [source, reason] of excluded) {
  if (!baselineComponents.includes(source)) errors.push(`Excluded source is absent from baseline inventory: ${source}`);
  if (!reason) errors.push(`Excluded source needs a reason: ${source}`);
}

if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Coverage is complete: ${covered.size} showcased, ${excluded.size} excluded, ${productItems.length} product component(s).`
);
