#!/usr/bin/env node

import { promises as fs } from "node:fs";

const [inventoryArg, catalogArg, graphArg] = process.argv.slice(2);
if (!inventoryArg || !catalogArg || !graphArg) {
  console.error("Usage: node validate-coverage.mjs <inventory.json> <catalog.json> <graph.json>");
  process.exit(2);
}

const normalize = (value) => value?.replaceAll("\\", "/").replace(/^\.\//, "");
const inventory = JSON.parse(await fs.readFile(inventoryArg, "utf8"));
const catalog = JSON.parse(await fs.readFile(catalogArg, "utf8"));
const graph = JSON.parse(await fs.readFile(graphArg, "utf8"));
const baseline = (inventory.components ?? []).map(normalize).filter(Boolean);
const items = (catalog.groups ?? []).flatMap((group) => group.items ?? []);
const roots = items.filter((item) => item.kind !== "foundation").map((item) => normalize(item.productionRoot));
const excluded = new Map((catalog.exclusions ?? []).map((item) => [normalize(item.source), item.reason?.trim()]));
const edges = new Map();
for (const edge of graph.edges ?? []) {
  const from = normalize(edge.from);
  const to = normalize(edge.to);
  if (!edges.has(from)) edges.set(from, []);
  edges.get(from).push(to);
}

const errors = [];
if (!inventory.scope?.id || !catalog.scope?.id) errors.push("Inventory and catalog must declare source scope.");
if (inventory.scope?.id !== catalog.scope?.id) errors.push(`Source scope mismatch: inventory=${inventory.scope?.id}, catalog=${catalog.scope?.id}`);
if ((inventory.scope?.environment ?? null) !== (catalog.scope?.environment ?? null)) {
  errors.push(`Source environment mismatch: inventory=${inventory.scope?.environment ?? "<none>"}, catalog=${catalog.scope?.environment ?? "<none>"}`);
}
if ((graph.unresolved ?? []).length) errors.push(`Production graph has ${graph.unresolved.length} unresolved local import(s).`);

const graphNodes = new Set((graph.nodes ?? []).map(normalize));
const covered = new Set();
const visit = (source) => {
  if (!source || covered.has(source)) return;
  covered.add(source);
  for (const next of edges.get(source) ?? []) visit(next);
};
for (const root of roots) {
  if (!graphNodes.has(root)) errors.push(`productionRoot is absent from production graph: ${root}`);
  visit(root);
}

for (const source of baseline) {
  if (!covered.has(source) && !excluded.get(source)) errors.push(`Uncovered component: ${source}`);
}
for (const [source, reason] of excluded) {
  if (!baseline.includes(source)) errors.push(`Excluded source is absent from baseline inventory: ${source}`);
  if (!reason) errors.push(`Excluded source needs a reason: ${source}`);
}
const productItems = items.filter((item) => item.kind === "product");
if (baseline.length >= 5 && productItems.length === 0) errors.push("Catalog has no product roots. Primitive-only coverage is incomplete.");

if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const coveredBaseline = baseline.filter((source) => covered.has(source));
console.log(`Coverage is complete: ${roots.length} production root(s), ${coveredBaseline.length} component(s) reached, ${excluded.size} excluded.`);
