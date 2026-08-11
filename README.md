# Storybook

A custom UI for the original Storybook runtime.

The project keeps the visual shell from `mishanaer/storybook`, while using upstream Storybook for the parts that should stay compatible with the ecosystem: CSF stories, story indexing, decorators, framework renderers, args inside the preview, HMR, loaders and play functions.

The key rule is simple: **we do not reimplement stories or component rendering**. The custom app reads Storybook's generated `index.json` and renders the selected story through Storybook's original `iframe.html` preview runtime.

## Architecture

```text
*.stories.tsx
    │
    ▼
Storybook Core
  ├─ CSF / indexers
  ├─ index.json
  ├─ decorators / loaders
  ├─ framework renderer
  └─ iframe.html preview
    │
    ▼
@mishanaer/storybook-shell
  ├─ custom catalog
  ├─ custom navigation
  ├─ custom theme UI
  └─ StorybookRuntime adapter
```

This gives the product a completely custom manager shell without replacing the Storybook story format or preview engine.

## Install

```bash
npm install github:mishanaer/storybook
```

You also need a normal Storybook installation in the product that owns the stories. The runtime targets Storybook 10.5+.

## Recommended setup

Build or serve the upstream Storybook under a path such as `/storybook/`.

A regular Storybook configuration remains unchanged:

```ts
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
};

export default config;
```

Stories are also ordinary CSF:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  component: Button,
  title: "Components/Button",
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Button" },
};

export const Loading: Story = {
  args: { loading: true },
};
```

Then mount the custom UI:

```jsx
import { StorybookRuntime } from "@mishanaer/storybook-shell";
import "@mishanaer/storybook-shell/styles.css";

export function App() {
  return <StorybookRuntime storybookUrl="/storybook/" />;
}
```

`StorybookRuntime` will:

1. fetch `/storybook/index.json` from Storybook Core;
2. use only entries whose type is `story`;
3. build the custom sidebar from real Storybook metadata;
4. keep the selected story in the page URL as `?story=<story-id>`;
5. render `/storybook/iframe.html?id=<story-id>&viewMode=story` inside the custom preview area;
6. react to browser back/forward navigation.

## Runtime API

### `StorybookRuntime`

- `storybookUrl` — base URL of the upstream Storybook build/dev server. Default: `/storybook/`.
- `theme` — optional controlled `light` / `dark` shell theme.
- `onThemeChange(theme)` — optional controlled-theme callback.
- `storyParam` — query-string key used for deep links. Default: `story`.
- `fetchImpl` — optional fetch implementation, useful for tests or custom transports.

### `StorybookPreview`

Low-level iframe renderer for an upstream Storybook story.

```jsx
<StorybookPreview storybookUrl="/storybook/" storyId="components-button--loading" />
```

### Adapter utilities

The package also exports:

- `storyEntriesFromIndex(index)`
- `groupsFromStorybookIndex(index)`
- `getStorybookIndexUrl(baseUrl)`
- `getStorybookPreviewUrl(baseUrl, storyId)`
- `readStoryIdFromLocation()`
- `writeStoryIdToLocation()`

These functions form the compatibility boundary between upstream Storybook and the custom UI.

## Existing shell API

`StorybookShell` is still exported for fully manual showcases. It accepts `groups`, `activeId`, `onSelect`, `onBack`, `theme`, `onToggleTheme` and `children`.

## What is intentionally upstream

The first integration keeps these responsibilities in Storybook itself:

- discovery and indexing of `.stories.*` files;
- CSF parsing;
- framework-specific rendering;
- decorators;
- loaders;
- story-level args used by the preview;
- play functions and interaction code;
- development HMR.

The custom repository owns the manager-facing product UI.

## Next integration layer

The next layer is a channel bridge for `args`, `argTypes`, globals and Storybook events. That lets Controls, Actions, Viewport and other manager features be redrawn in this UI while their state and execution still come from Storybook.

## Develop

```bash
npm install
npm test
npm run dev
```

Build the live example with `npm run build`. Verify the package contents with `npm run pack:check`.
