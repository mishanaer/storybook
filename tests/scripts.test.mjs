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

  const { stdout } = await exec("node", [path.join(repository, "storybook/scripts/inventory.mjs"), fixture]);
  const inventory = JSON.parse(stdout);

  assert.equal(inventory.framework, "react-vite");
  assert.deepEqual(inventory.components, ["src/components/Button.tsx"]);
  assert.deepEqual(inventory.tokens.names, ["--surface"]);
});

test("example catalog follows the portable contract", async () => {
  const catalog = path.join(repository, "storybook/assets/host-files/catalog.example.json");
  const { stdout } = await exec("node", [path.join(repository, "storybook/scripts/validate-catalog.mjs"), catalog]);
  assert.match(stdout, /Catalog is valid: 3 item\(s\)/);
});

test("coverage validator rejects primitive-only catalogs and accepts explicit coverage", async () => {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "showcase-coverage-"));
  const inventory = path.join(fixture, "inventory.json");
  const catalog = path.join(fixture, "catalog.json");
  const components = ["Button", "Input", "Card", "Composer", "Transcript"].map(
    (name) => `src/components/${name}.tsx`
  );
  await fs.writeFile(inventory, JSON.stringify({ components }));
  await fs.writeFile(
    catalog,
    JSON.stringify({
      title: "Product UI",
      groups: [
        {
          id: "components",
          title: "Components",
          items: components.slice(0, 3).map((source) => ({
            id: path.basename(source, ".tsx").toLowerCase(),
            title: path.basename(source, ".tsx"),
            source: source.replace(".tsx", ".showcase.tsx"),
            componentSource: source,
            kind: "primitive",
          })),
        },
      ],
      exclusions: components.slice(3).map((source) => ({
        source,
        reason: "Requires a native runtime fixture.",
      })),
    })
  );

  await assert.rejects(
    exec("node", [
      path.join(repository, "storybook/scripts/validate-coverage.mjs"),
      inventory,
      catalog,
    ]),
    /Catalog has no product components/
  );

  await fs.writeFile(
    catalog,
    JSON.stringify({
      title: "Product UI",
      groups: [
        {
          id: "components",
          title: "Components",
          items: [
            {
              id: "composer",
              title: "Composer",
              source: "src/components/Composer.showcase.tsx",
              componentSource: "src/components/Composer.tsx",
              kind: "product",
            },
          ],
        },
      ],
      exclusions: components
        .filter((source) => !source.endsWith("Composer.tsx"))
        .map((source) => ({ source, reason: "Requires a native runtime fixture." })),
    })
  );

  const { stdout } = await exec("node", [
    path.join(repository, "storybook/scripts/validate-coverage.mjs"),
    inventory,
    catalog,
  ]);
  assert.match(stdout, /Coverage is complete: 1 showcased, 4 excluded, 1 product component/);
});

test("canonical shell installer copies immutable shell assets", async () => {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "showcase-shell-"));
  const target = "src/showcase/shell";
  await exec("node", [
    path.join(repository, "storybook/scripts/install-shell.mjs"),
    fixture,
    target,
  ]);

  const validator = path.join(repository, "storybook/scripts/validate-shell.mjs");
  const targetDirectory = path.join(fixture, target);
  const { stdout } = await exec("node", [validator, targetDirectory]);
  assert.match(stdout, /installed unchanged/);

  await fs.appendFile(path.join(targetDirectory, "canonical-shell.css"), "\n.host-override {}\n");
  await assert.rejects(exec("node", [validator, targetDirectory]), /Canonical shell file was modified/);
});
