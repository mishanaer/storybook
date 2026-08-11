# Butcher

Butcher is a reusable custom Storybook shell for React projects. It replaces the
default Storybook manager UI with the Butcher catalog, while keeping Storybook
Core responsible for discovering and rendering the connected project's stories.

In other words:

- Butcher owns the visible sidebar, navigation, theme, responsive layout, and
  preview chrome;
- the target project decides which components and stories appear in it;
- Butcher does not copy or replace the target project's components.

## Connect to a project

Install Butcher as a development dependency:

```bash
npm install --save-dev github:mishanaer/Butcher
```

Create `.storybook/main.js` in the target project:

```js
import { defineButcherConfig } from "@mishanaer/butcher/config"

export default defineButcherConfig({
    stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
})
```

Add scripts to the target project's `package.json`:

```json
{
    "scripts": {
        "storybook": "butcher dev",
        "build:storybook": "butcher build"
    }
}
```

Run:

```bash
npm run storybook
```

The catalog opens at <http://localhost:6006>. The pink Storybook sidebar,
onboarding card, toolbar, and addon panel are replaced by the Butcher shell. No
local Storybook dependency, addon registration, or preview decorator is required.

Stories continue to import components from the target project:

```jsx
import Button from "../components/Button"

export default { title: "Components/Button" }

export const Default = {
    render: () => <Button>Project component</Button>,
}
```

The component is local to the project, while primitives such as
`--accent-green`, `--ui-space-16`, and `--ui-radius-22` are available in the
preview automatically.

## What the package includes

- `src/storybook/manager.jsx` — bridge from the real Storybook index to the
  custom Butcher shell;
- `src/StorybookShell.jsx` — responsive MiniApps-based catalog and preview UI;
- `preset.js` — reusable manager, preview, and Vite integration;
- `bin/butcher.mjs` — `butcher dev` and `butcher build` commands;
- `primitives/` — colors, typography, spacing, radii, fonts, and Material Symbols;
- `mini-app/` — the provider and styles used around project stories;
- `mini-app/storybook/` — Butcher's own reference catalog and visual test bench.

## Develop Butcher itself

The catalog in `mini-app/storybook` is a real consumer of Butcher. It links the
package through `portal:../..`, imports only `@mishanaer/butcher/config`, and
runs the public `butcher` binary. Its MiniApps components and stories play the
same role as local application code in any other connected project.

```bash
corepack yarn install --immutable
corepack yarn --cwd mini-app/storybook install --immutable
corepack yarn dev
```

Run all module, source, token, and production-build checks:

```bash
corepack yarn verify
```
