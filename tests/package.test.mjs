import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";

const repository = path.resolve(import.meta.dirname, "..");

test("package exposes the reusable config, preset, UI, and primitives", async () => {
  const packageJson = JSON.parse(
    await fs.readFile(path.join(repository, "package.json"), "utf8"),
  );

  assert.equal(packageJson.name, "@mishanaer/butcher");
  assert.equal(packageJson.private, undefined);
  assert.equal(packageJson.bin, "./bin/butcher.mjs");
  assert.equal(packageJson.exports["./config"].import, "./src/config.js");
  assert.equal(packageJson.exports["./manager"], "./src/storybook/manager.jsx");
  assert.equal(packageJson.exports["./shell"], "./src/StorybookShell.jsx");
  assert.equal(packageJson.exports["./mini-app"], "./mini-app/index.js");
  assert.equal(packageJson.exports["./primitives"], "./primitives/index.js");
});

test("defineButcherConfig adds the preset without replacing project options", async () => {
  const { defineButcherConfig } = await import("../src/config.js");
  const config = defineButcherConfig({
    stories: ["../src/**/*.stories.jsx"],
    addons: ["project-addon"],
    core: { disableTelemetry: false },
  });

  assert.deepEqual(config.stories, ["../src/**/*.stories.jsx"]);
  assert.match(config.addons[0], /preset\.js$/);
  assert.equal(config.addons[1], "project-addon");
  assert.equal(config.core.disableTelemetry, false);
  assert.equal(path.isAbsolute(config.framework.name), true);
});

test("preset supplies the Butcher manager, Mini App preview, and target Vite settings", async () => {
  const { managerEntries, previewAnnotations, viteFinal } =
    await import("../preset.js");
  const manager = managerEntries(["project-manager.js"]);
  const annotations = previewAnnotations(["project-preview.js"]);
  const markerPlugin = { name: "project-plugin" };
  const config = await viteFinal(
    {
      plugins: [markerPlugin],
      resolve: { dedupe: ["project-runtime"] },
      optimizeDeps: { exclude: ["project-package"] },
    },
    {
      configDir: path.join(
        repository,
        "tests/fixtures/react-project/.storybook",
      ),
    },
  );

  assert.equal(manager[0], "project-manager.js");
  assert.match(manager.at(-1), /src\/storybook\/manager\.jsx$/);
  assert.equal(annotations[0], "project-preview.js");
  assert.match(annotations.at(-1), /src\/preview\.js$/);
  assert.equal(config.plugins.includes(markerPlugin), true);
  assert.equal(config.esbuild.jsx, "automatic");
  assert.equal(config.resolve.dedupe.includes("project-runtime"), true);
  assert.equal(config.resolve.dedupe.includes("react"), true);
  assert.equal(config.optimizeDeps.exclude.includes("project-package"), true);
  assert.equal(config.optimizeDeps.include.includes("react/jsx-runtime"), true);
});

test("manager shell uses primitive fonts and icons", async () => {
  const [
    shell,
    styles,
    typography,
    manager,
    preview,
    previewStyles,
    miniAppStyles,
  ] =
    await Promise.all([
      fs.readFile(path.join(repository, "src/StorybookShell.jsx"), "utf8"),
      fs.readFile(path.join(repository, "src/storybook-shell.css"), "utf8"),
      fs.readFile(path.join(repository, "primitives/typography.css"), "utf8"),
      fs.readFile(path.join(repository, "src/storybook/manager.jsx"), "utf8"),
      fs.readFile(path.join(repository, "src/preview.js"), "utf8"),
      fs.readFile(path.join(repository, "src/preview.css"), "utf8"),
      fs.readFile(path.join(repository, "mini-app/styles/index.css"), "utf8"),
    ]);

  assert.match(shell, /IconChevronRight/);
  assert.match(shell, /IconMoon/);
  assert.doesNotMatch(shell, /<svg/);
  assert.match(styles, /mini-app\/styles\/index\.css/);
  assert.match(miniAppStyles, /primitives\/material-symbols\.css/);
  assert.match(miniAppStyles, /primitives\/typography\.css/);
  assert.doesNotMatch(styles, /BlinkMacSystemFont/);
  assert.match(typography, /SBSansUI-Regular\.woff2/);
  assert.match(
    styles,
    /\.storybook-sidebar[\s\S]*background: var\(--surface\)/,
  );
  assert.doesNotMatch(styles, /z-index: 2147483647/);
  assert.doesNotMatch(styles, /storybook-sidebar-in/);
  assert.match(
    styles,
    /\.storybook-catalog-group button[\s\S]*background: var\(--elevation-1\)/,
  );
  assert.match(shell, /GlassContainer/);
  assert.match(shell, /PanelHeader/);
  assert.match(shell, /tappable=\{false\}/);
  assert.match(
    styles,
    /\.storybook-appbar-glass[\s\S]*--glass-border-color: transparent/,
  );
  assert.match(
    styles,
    /\.storybook-appbar-glass[\s\S]*--glass-background-color: var\(--surface\)/,
  );
  assert.match(
    styles,
    /\.storybook-appbar-glass[\s\S]*--glass-shadow-color: var\(--surface\)/,
  );
  assert.match(
    styles,
    /\.storybook-appbar::before[\s\S]*var\(--surface\) 0 64px,[\s\S]*transparent 80px/,
  );
  assert.match(manager, /butcherTheme/);
  assert.doesNotMatch(manager, /butcherStory/);
  assert.doesNotMatch(manager, /key=\{previewHref\}/);
  assert.match(manager, /function BufferedPreview/);
  assert.match(manager, /storybook-preview-frame is-pending/);
  assert.match(manager, /PREVIEW_READY_MESSAGE/);
  assert.match(manager, /MANAGER_NOTIFICATION_EVENT/);
  assert.match(manager, /api\.addNotification\(notification\)/);
  assert.match(manager, /api\.clearNotification\(notificationId\)/);
  assert.match(manager, /pendingFrameRef/);
  assert.match(styles, /\.storybook-preview-frame\.is-pending[\s\S]*visibility: hidden/);
  assert.match(
    styles,
    /@media \(max-width: 767px\)[\s\S]*\.storybook-sidebar,[\s\S]*\.storybook-detail[\s\S]*height: 100%;[\s\S]*min-height: 0/,
  );
  assert.doesNotMatch(
    styles,
    /@media \(max-width: 767px\)[\s\S]*\.storybook-shell[\s\S]*position: relative/,
  );
  assert.match(manager, /storyId: state\.storyId/);
  assert.doesNotMatch(preview, /MiniAppProvider/);
  assert.match(preview, /--tg-color-scheme/);
  assert.match(preview, /\["Butcher", "Primitives", "Components", "Screens"\]/);
  assert.match(preview, /function PreviewReady/);
  assert.match(preview, /document\.fonts\?\.ready/);
  assert.match(preview, /butcherFrameKey/);
  assert.ok(
    preview.indexOf('get("butcherTheme")') <
      preview.indexOf("context?.globals?.butcherTheme"),
  );
  assert.match(preview, /initialGlobals/);
  assert.match(previewStyles, /#storybook-root[\s\S]*var\(--surface\)/);
  assert.match(
    miniAppStyles,
    /:where\(\[data-mini-app\]\)[\s\S]*user-select: none/,
  );
  assert.match(
    miniAppStyles,
    /:where\(input, textarea, \[contenteditable="true"\]\)[\s\S]*user-select: text/,
  );
});

test("Butcher's reference catalog consumes the public Butcher package", async () => {
  const [consumerPackage, consumerConfig, selfHostedStory, screenState] = await Promise.all([
    fs
      .readFile(
        path.join(repository, "mini-app/storybook/package.json"),
        "utf8",
      )
      .then(JSON.parse),
    fs.readFile(
      path.join(repository, "mini-app/storybook/.storybook/main.js"),
      "utf8",
    ),
    fs.readFile(
      path.join(
        repository,
        "mini-app/storybook/examples/butcher/ButcherStates.example.jsx",
      ),
      "utf8",
    ),
    fs.readFile(path.join(repository, "mini-app/utils/screenState.js"), "utf8"),
  ]);

  assert.equal(
    consumerPackage.devDependencies["@mishanaer/butcher"],
    "portal:../..",
  );
  assert.match(consumerPackage.scripts.dev, /^butcher dev/);
  assert.equal(consumerPackage.devDependencies.storybook, undefined);
  assert.equal(
    consumerPackage.devDependencies["@storybook/react-vite"],
    undefined,
  );
  assert.match(consumerConfig, /from "@mishanaer\/butcher\/config"/);
  assert.doesNotMatch(consumerConfig, /\.\.\/\.\.\/\.\.\/src\/config/);
  assert.match(selfHostedStory, /from "@mishanaer\/butcher\/mini-app"/);
  assert.match(selfHostedStory, /StorybookShell/);
  assert.match(screenState, /export function getScreenState/);
  assert.match(screenState, /export function setScreenState/);
});
