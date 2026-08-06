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
  assert.equal(inventory.scope.id, path.basename(fixture));
  assert.equal(inventory.scope.environment, null);
  assert.deepEqual(inventory.components, ["src/components/Button.tsx"]);
  assert.deepEqual(inventory.tokens.names, ["--surface"]);
});

test("example catalog follows the portable contract", async () => {
  const catalog = path.join(repository, "storybook/assets/host-files/catalog.example.json");
  const { stdout } = await exec("node", [path.join(repository, "storybook/scripts/validate-catalog.mjs"), catalog]);
  assert.match(stdout, /Catalog is valid: 3 item\(s\)/);
});

test("coverage validator counts components reached through a production root", async () => {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "showcase-coverage-"));
  const inventory = path.join(fixture, "inventory.json");
  const catalog = path.join(fixture, "catalog.json");
  const graph = path.join(fixture, "graph.json");
  const components = ["Button", "Input", "Card", "Composer", "Transcript"].map(
    (name) => `src/components/${name}.tsx`
  );
  await fs.writeFile(
    inventory,
    JSON.stringify({ scope: { id: "type", environment: "desktop" }, components })
  );
  await fs.writeFile(
    graph,
    JSON.stringify({
      entry: "src/main.tsx",
      nodes: ["src/main.tsx", ...components],
      edges: [
        { from: "src/main.tsx", to: "src/components/Composer.tsx" },
        { from: "src/components/Composer.tsx", to: "src/components/Button.tsx" },
        { from: "src/components/Composer.tsx", to: "src/components/Input.tsx" },
        { from: "src/components/Composer.tsx", to: "src/components/Card.tsx" },
      ],
      unresolved: [],
    })
  );
  await fs.writeFile(
    catalog,
    JSON.stringify({
      title: "Product UI",
      scope: { id: "type", environment: "desktop" },
      preview: { adapter: "react-vite", isolation: "iframe", entry: "src/showcase/preview.tsx" },
      groups: [
        {
          id: "components",
          title: "Components",
          items: components.slice(0, 3).map((source) => ({
            id: path.basename(source, ".tsx").toLowerCase(),
            title: path.basename(source, ".tsx"),
            source: source.replace(".tsx", ".showcase.tsx"),
            productionRoot: source,
            kind: "primitive",
            states: ["default"],
            boundaries: [],
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
      graph,
    ]),
    /Catalog has no product roots/
  );

  await fs.writeFile(
    catalog,
    JSON.stringify({
      title: "Product UI",
      scope: { id: "type", environment: "desktop" },
      preview: { adapter: "react-vite", isolation: "iframe", entry: "src/showcase/preview.tsx" },
      groups: [
        {
          id: "components",
          title: "Components",
          items: [
            {
              id: "composer",
              title: "Composer",
              source: "src/components/Composer.showcase.tsx",
              productionRoot: "src/components/Composer.tsx",
              kind: "product",
              states: ["default", "error"],
              boundaries: ["http"],
            },
          ],
        },
      ],
      exclusions: components
        .filter((source) => source.endsWith("Transcript.tsx"))
        .map((source) => ({ source, reason: "Requires a native runtime fixture." })),
    })
  );

  const { stdout } = await exec("node", [
    path.join(repository, "storybook/scripts/validate-coverage.mjs"),
    inventory,
    catalog,
    graph,
  ]);
  assert.match(stdout, /Coverage is complete: 1 production root\(s\), 4 component\(s\) reached, 1 excluded/);
});

test("production graph resolves React roots and tsconfig aliases", async () => {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "showcase-graph-"));
  await fs.mkdir(path.join(fixture, "src/components"), { recursive: true });
  await fs.writeFile(path.join(fixture, "tsconfig.json"), JSON.stringify({ compilerOptions: { baseUrl: ".", paths: { "@/*": ["src/*"] } } }));
  await fs.writeFile(path.join(fixture, "src/main.tsx"), 'import { App } from "@/App"; export { App };');
  await fs.writeFile(path.join(fixture, "src/App.tsx"), 'import { Button } from "./components/Button"; export const App = () => <Button />;');
  await fs.writeFile(path.join(fixture, "src/components/Button.tsx"), "export const Button = () => <button />;");

  const { stdout } = await exec("node", [
    path.join(repository, "storybook/scripts/production-graph.mjs"),
    fixture,
    "--entry",
    "src/main.tsx",
  ]);
  const graph = JSON.parse(stdout);
  assert.deepEqual(graph.nodes, ["src/App.tsx", "src/components/Button.tsx", "src/main.tsx"]);
  assert.deepEqual(graph.unresolved, []);
});

test("scenario validator accepts a production import and rejects copied visual UI", async () => {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "showcase-scenario-"));
  await fs.mkdir(path.join(fixture, "src/screens"), { recursive: true });
  await fs.mkdir(path.join(fixture, "src/showcase"), { recursive: true });
  await fs.writeFile(path.join(fixture, "src/screens/Settings.tsx"), "export const Settings = () => <main />;");
  const scenario = path.join(fixture, "src/showcase/Settings.showcase.tsx");
  await fs.writeFile(scenario, 'import { Settings } from "../screens/Settings"; export default () => <Settings />;');
  const catalog = path.join(fixture, "catalog.json");
  await fs.writeFile(catalog, JSON.stringify({ groups: [{ items: [{ id: "settings", source: "src/showcase/Settings.showcase.tsx", productionRoot: "src/screens/Settings.tsx", kind: "product" }] }] }));
  const validator = path.join(repository, "storybook/scripts/validate-scenarios.mjs");
  const { stdout } = await exec("node", [validator, fixture, catalog]);
  assert.match(stdout, /production-faithful: 1 checked/);

  await fs.writeFile(scenario, 'import "./preview.css"; import { Settings } from "../screens/Settings"; const FakeWindow = () => <div />; export default FakeWindow;');
  await assert.rejects(exec("node", [validator, fixture, catalog]), /imports showcase-only styles/);
});

test("surface discovery lists applications and their runnable environments", async () => {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "showcase-surfaces-"));
  for (const [directory, name, script] of [
    ["apps/type", "type-desktop", "dev:desktop"],
    ["apps/admin", "type-admin", "dev:web"],
  ]) {
    const root = path.join(fixture, directory);
    await fs.mkdir(root, { recursive: true });
    await fs.writeFile(
      path.join(root, "package.json"),
      JSON.stringify({ name, scripts: { [script]: "vite" }, dependencies: { react: "19", vite: "7" } })
    );
  }

  const { stdout } = await exec("node", [
    path.join(repository, "storybook/scripts/discover-surfaces.mjs"),
    fixture,
  ]);
  const result = JSON.parse(stdout);
  assert.deepEqual(
    result.surfaces.map(({ id, root, environments }) => ({ id, root, environments })),
    [
      { id: "type-admin", root: "apps/admin", environments: ["dev:web"] },
      { id: "type-desktop", root: "apps/type", environments: ["dev:desktop"] },
    ]
  );
});

test("coverage validator rejects a catalog from another environment", async () => {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "showcase-scope-"));
  const inventory = path.join(fixture, "inventory.json");
  const catalog = path.join(fixture, "catalog.json");
  await fs.writeFile(
    inventory,
    JSON.stringify({
      scope: { id: "type", environment: "desktop" },
      components: ["src/components/Composer.tsx"],
    })
  );
  await fs.writeFile(
    catalog,
    JSON.stringify({
      title: "Type UI",
      scope: { id: "type", environment: "web" },
      preview: { adapter: "react-vite", isolation: "iframe", entry: "src/showcase/preview.tsx" },
      groups: [
        {
          id: "type",
          title: "Type",
          items: [
            {
              id: "composer",
              title: "Composer",
              source: "src/components/Composer.showcase.tsx",
              productionRoot: "src/components/Composer.tsx",
              kind: "product",
              states: ["default"],
              boundaries: [],
            },
          ],
        },
      ],
      exclusions: [],
    })
  );
  await fs.writeFile(
    path.join(fixture, "graph.json"),
    JSON.stringify({
      entry: "src/main.tsx",
      nodes: ["src/main.tsx", "src/components/Composer.tsx"],
      edges: [{ from: "src/main.tsx", to: "src/components/Composer.tsx" }],
      unresolved: [],
    })
  );

  await assert.rejects(
    exec("node", [
      path.join(repository, "storybook/scripts/validate-coverage.mjs"),
      inventory,
      catalog,
      path.join(fixture, "graph.json"),
    ]),
    /Source environment mismatch/
  );
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
