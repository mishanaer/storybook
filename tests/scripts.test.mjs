import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const exec = promisify(execFile);
const repository = path.resolve(import.meta.dirname, "..");

test("inventory finds host components and tokens", async () => {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "showcase-inventory-"));
  await fs.mkdir(path.join(fixture, "src/components"), { recursive: true });
  await fs.writeFile(path.join(fixture, "package.json"), JSON.stringify({ dependencies: { react: "19", vite: "7" } }));
  await fs.writeFile(path.join(fixture, "src/components/Button.tsx"), "export const Button = () => <button />;");
  await fs.writeFile(path.join(fixture, "src/tokens.css"), ":root { --surface: #fff; }");

  const { stdout } = await exec("node", [path.join(repository, "build-component-showcase/scripts/inventory.mjs"), fixture]);
  const inventory = JSON.parse(stdout);

  assert.equal(inventory.framework, "react-vite");
  assert.deepEqual(inventory.components, ["src/components/Button.tsx"]);
  assert.deepEqual(inventory.tokens.names, ["--surface"]);
});

test("example catalog follows the portable contract", async () => {
  const catalog = path.join(repository, "build-component-showcase/assets/host-files/catalog.example.json");
  const { stdout } = await exec("node", [path.join(repository, "build-component-showcase/scripts/validate-catalog.mjs"), catalog]);
  assert.match(stdout, /Catalog is valid: 2 item\(s\)/);
});
