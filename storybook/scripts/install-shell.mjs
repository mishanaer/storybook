#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [productRootArg, targetArg] = process.argv.slice(2);
if (!productRootArg || !targetArg) {
  console.error("Usage: node install-shell.mjs <product-root> <target-directory>");
  process.exit(2);
}

const productRoot = path.resolve(productRootArg);
const targetDirectory = path.resolve(productRoot, targetArg);
if (!targetDirectory.startsWith(`${productRoot}${path.sep}`)) {
  console.error("Target directory must be inside the product root.");
  process.exit(1);
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const assetDirectory = path.resolve(scriptDirectory, "../assets/showcase-shell");
const files = ["CanonicalStorybookShell.jsx", "canonical-shell.css"];

await fs.mkdir(targetDirectory, { recursive: true });
for (const file of files) {
  await fs.copyFile(path.join(assetDirectory, file), path.join(targetDirectory, file));
}

console.log(`Installed canonical Storybook shell in ${targetDirectory}`);
