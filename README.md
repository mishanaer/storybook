# Storybook

A custom Storybook UI powered by the original Storybook runtime.

This repository owns the visible interface — sidebar, navigation, responsive layout, theme and preview chrome — while upstream Storybook keeps responsibility for the actual mechanics: CSF stories, story discovery, framework rendering, decorators, loaders, play functions, args/globals infrastructure, HMR and Preview.

[Open the shell demo](https://storybook-showcase-seven.vercel.app)

## How it works

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
Storybook adapter
    │
    ▼
Custom Storybook UI
    │
    ▼
Original Storybook Preview
```

The goal is not to reimplement Storybook. The goal is to keep Storybook-compatible stories and runtime behavior while replacing the default manager UI with the interface from this repository.

## Current functionality

- Reads the real Storybook story index
- Automatically turns discovered `*.stories.*` files into the custom catalog
- Uses Storybook's navigation API when selecting a story
- Renders stories through the original Storybook Preview iframe
- Keeps the selected story in the manager URL for deep linking
- Hides the default Storybook navigation, toolbar and addon panel
- Keeps the existing standalone `StorybookShell` API available

## Install

Use this package inside an existing Storybook 10+ project:

```bash
npm install github:mishanaer/storybook
```

Add it to `.storybook/main.ts`:

```ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@mishanaer/storybook-shell"],
};

export default config;
```

Then run Storybook normally:

```bash
npm run storybook
```

## Stories stay standard

No custom story format is required. Existing CSF stories remain unchanged:

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

Storybook Core discovers and processes these stories; this package only replaces the visible manager experience.

## Architecture

`src/storybook/manager.jsx` is the bridge between Storybook Manager and the custom shell. It reads Storybook state, handles navigation and generates Preview URLs.

`src/storybook/adapter.js` converts Storybook's story index into the catalog model expected by `StorybookShell`. Keeping that transformation separate means the UI does not need to depend directly on Storybook's internal index shape.

`preset.js` registers the custom manager entry when the package is added as a Storybook addon.

## Next

The current integration covers the core vertical slice: story discovery → custom navigation → original Preview. The next layers are custom UI for Controls/Args, Globals, Actions/Interactions and richer Storybook addon surfaces without bringing back the default manager chrome.

## Standalone shell

The UI can still be used without Storybook:

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

- `groups` — sidebar sections and `{ id, title }` items
- `activeId` — selected item ID or `null`
- `onSelect(id)` — item selection handler
- `onBack()` — mobile back handler
- `theme` — `light` or `dark`
- `onToggleTheme()` — theme action handler
- `children` — preview content

## Development

```bash
npm install
npm test
npm run build
```

Verify package contents with:

```bash
npm run pack:check
```
