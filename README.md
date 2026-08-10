# Storybook Shell

A small React wrapper for component showcases. It provides the canonical sidebar, navigation, theme switcher, responsive layout, and preview area. It does not discover, generate, copy, or validate product components.

[Open the live example](https://storybook-showcase-seven.vercel.app)

## Install

```bash
npm install github:mishanaer/storybook
```

## Use

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

The package owns only the showcase chrome. The application owns the catalog and everything rendered inside the preview.

## API

- `groups` — sidebar sections and `{ id, title }` items.
- `activeId` — selected item ID or `null`.
- `onSelect(id)` — item selection handler.
- `onBack()` — mobile back handler.
- `theme` — `light` or `dark`.
- `onToggleTheme()` — theme action handler.
- `children` — any existing showcase page.

## Develop

```bash
npm install
npm run dev
```

Build the live example with `npm run build`. Verify the package contents with `npm run pack:check`.
