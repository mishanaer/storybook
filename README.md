# storybook

A reusable Codex skill for turning an existing product into a lightweight component showcase.

This is intentionally not the Storybook framework. The skill studies the product you already have, reuses its real components and design tokens, and builds a quiet Mini Apps-style catalog inside the existing stack: searchable navigation, component pages, themes, states, and responsive previews without a heavy addon interface.

## Install

```bash
git clone https://github.com/mishanaer/storybook.git
cp -R storybook/storybook ~/.codex/skills/
```

Restart Codex, then ask:

```text
Use $storybook to build a component showcase from this product.
```

## What the skill does

- inventories components, scenarios, CSS tokens, and the host framework;
- chooses the least invasive integration for React, Next.js, Vue, SvelteKit, or plain web projects;
- builds the showcase from production components instead of cloning them;
- creates foundation pages and realistic component states;
- keeps showcase code out of production bundles unless explicitly requested;
- validates the catalog and runs the host project's own checks.

## Example

Live demo: [storybook-showcase-seven.vercel.app](https://storybook-showcase-seven.vercel.app)

The live demo is a production build of the [Deslop Mini Apps showcase](https://github.com/mishanaer/deslop/tree/main/mini-app). It renders the product's real components, tokens, typography, themes, and interaction states rather than a visual imitation.

## Repository structure

```text
storybook/
├── SKILL.md
├── agents/openai.yaml
├── scripts/
├── references/
└── assets/
```

The skill uses the host product as the source of truth and does not introduce another component library by default.

## License

MIT
