# Storybook Shell

A custom Storybook manager UI powered by the original Storybook runtime.

The package keeps the visual shell from this repository, while Storybook remains responsible for story discovery, CSF, rendering, args/globals, decorators, loaders, play functions, framework integration, HMR, and the preview runtime.

[Open the shell demo](https://storybook-showcase-seven.vercel.app)

## What this integration does

- Reads the real Storybook story index from the manager.
- Converts discovered `*.stories.*` entries into the shell catalog.
- Uses Storybook's own navigation API when a story is selected.
- Renders the selected story through Storybook's original Preview iframe.
- Keeps deep-linkable story state in the Storybook manager URL.
- Hides Storybook's default navigation, toolbar, and addon panel so this repository owns the visible chrome.
- Does not reimplement CSF or component rendering.

## Install as the Storybook UI

This package expects an existing Storybook 10+ project.

```bash
npm install github:mishanaer/storybook
```

Add the package to `.storybook/main.ts`:

```ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@mishanaer/storybook-shell",
  ],
};

export default config;
```

Run Storybook normally:

```bash
npm run storybook
```

Your existing stories stay unchanged:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: "Button",
  },
};
```

Those stories are discovered by Storybook Core and shown by this repository's shell.

## Architecture

```text
*.stories.tsx
    │
    ▼
Storybook Core / CSF / story index
    │
    ▼
storybook/manager-api
    │
    ▼
src/storybook/adapter.js
    │
    ▼
StorybookShell (this repository's UI)
    │
    ▼
Storybook Preview iframe
```

`src/storybook/manager.jsx` is intentionally a thin bridge. It uses documented Storybook manager APIs for navigation and preview URLs, and keeps story-index normalization in `src/storybook/adapter.js` so changes to Storybook internals stay isolated from the shell UI.

## Shell-only usage

The original shell API is still available if you want to use the UI without Storybook:

```jsx
import { useState } from "react";
import { StorybookShell } from "@mishanaer/storybook-shell";

const groups = [
  {
    id: "components",
    title: "Components",
    items: [
      { id: "button", title: "Button" },
      { id: "card", title: "Card" },
    ],
  },
];

export function Showcase() {
  const [activeId, setActiveId] = useState("button");
  const [theme, setTheme] = useState("light");

  return (
    <StorybookShell
      groups={groups}
      activeId={activeId}
      onSelect={setActiveId}
      onBack={() => setActiveId(null)}
      theme={theme}
      onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {activeId === "button" ? <YourButtonExamples /> : <YourCardExamples />}
    </StorybookShell>
  );
}
```

## Shell API

- `groups` — sidebar sections and `{ id, title }` items.
- `activeId` — selected item ID or `null`.
- `onSelect(id)` — item selection handler.
- `onBack()` — mobile back handler.
- `theme` — `light` or `dark`.
- `onToggleTheme()` — theme action handler.
- `children` — preview content.

## Develop

```bash
npm install
npm test
npm run build
```

Build the live example with `npm run build`. Verify the package contents with `npm run pack:check`.
