import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";

const repository = path.resolve(import.meta.dirname, "..");

test("package exports the shell and its types", async () => {
  const pkg = JSON.parse(await fs.readFile(path.join(repository, "package.json"), "utf8"));
  assert.equal(pkg.name, "@mishanaer/storybook-shell");
  assert.equal(pkg.private, undefined);
  assert.equal(pkg.exports["."].import, "./src/index.js");
  assert.equal(pkg.exports["."].types, "./src/index.d.ts");
});

test("repository contains only the wrapper implementation", async () => {
  await fs.access(path.join(repository, "src/StorybookShell.jsx"));
  await fs.access(path.join(repository, "src/storybook-shell.css"));
  await assert.rejects(fs.access(path.join(repository, "storybook/SKILL.md")));
});
