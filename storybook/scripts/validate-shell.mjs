#!/usr/bin/env node

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const targetArg = process.argv[2];
if (!targetArg) {
  console.error("Usage: node validate-shell.mjs <target-directory>");
  process.exit(2);
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const assetDirectory = path.resolve(scriptDirectory, "../assets/showcase-shell");
const targetDirectory = path.resolve(targetArg);
const files = ["CanonicalStorybookShell.jsx", "canonical-shell.css"];
const digest = (value) => createHash("sha256").update(value).digest("hex");
const errors = [];

for (const file of files) {
  try {
    const [canonical, installed] = await Promise.all([
      fs.readFile(path.join(assetDirectory, file)),
      fs.readFile(path.join(targetDirectory, file)),
    ]);
    if (digest(canonical) !== digest(installed)) errors.push(`Canonical shell file was modified: ${file}`);
  } catch (error) {
    errors.push(`Canonical shell file is missing: ${file} (${error.code ?? error.message})`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Canonical Storybook shell is installed unchanged.");
