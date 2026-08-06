---
name: storybook
description: Build or refresh a lightweight component showcase inside an existing web product by discovering its real components, design tokens, themes, and states. Use when Codex needs to create a component gallery, UI kit browser, design-system showroom, internal Storybook alternative, component catalog, or a Mini Apps-style showcase without introducing a second component library or a heavy standalone documentation framework.
---

# Storybook

Create the showcase from the host product, not beside it. Reuse its runtime, components, tokens, fonts, providers, routing conventions, and build tooling.

## Workflow

1. Inspect repository instructions and the working tree. Preserve unrelated changes.
2. Run `node scripts/inventory.mjs <product-root>` from this skill directory. Use `--out <path>` only when a persisted inventory helps.
3. Inspect the detected entry points, component exports, token sources, providers, and existing routes. Read [references/architecture.md](references/architecture.md).
4. Choose the least invasive integration described in [references/framework-recipes.md](references/framework-recipes.md). Prefer a product route or alternate dev entry over a separate application.
5. Create a catalog grouped into `Foundations`, `Components`, and product-specific sections. Use stable slugs and lazy imports where the host supports them.
6. Add one colocated `*.showcase.*` scenario module per documented component. Import the production component; never duplicate its implementation.
7. Build a quiet split-view shell: searchable sidebar, detail canvas, theme switch, and responsive single-column navigation. Use the host design system for every visible control.
8. Add foundation pages for colors, typography, spacing, radii, icons, and motion only when those primitives exist in the product.
9. Cover meaningful states: default, pressed or active, disabled, loading, error, long content, narrow width, and dark theme where supported.
10. Validate routes and catalog with `node scripts/validate-catalog.mjs <catalog.json>` when using the JSON contract. Run the host lint, typecheck, tests, and production build.
11. Open the showcase in a browser and verify navigation, responsive layout, theme inheritance, interactions, and absence of runtime errors.

## Product rules

- Keep the product as the source of truth. Do not create local token or component substitutes.
- Keep production bundles unchanged. Load showcase modules only from the showcase entry or development route.
- Do not add Storybook, Ladle, Histoire, or another UI framework unless the user explicitly asks.
- Preserve providers required by real components: theme, localization, router, data clients, portals, and platform adapters.
- Stub network boundaries, not visual components. Keep fixtures deterministic and local.
- Make the first useful screen render even when optional APIs are unavailable.
- Hide the sidebar scrollbar without disabling scrolling.
- Use the canvas background token declared by the host product; never hardcode light or dark canvas colors.
- Keep controls few and task-oriented. Prefer scenario sections over generic prop tables.

## Bundled resources

- Use `assets/example-showcase/` as a runnable visual example of the interaction model, not as a replacement design system.
- Use `assets/host-files/catalog.example.json` as the portable catalog contract.
- Read `references/architecture.md` for the required information architecture and acceptance criteria.
- Read `references/framework-recipes.md` only for the detected host framework.

## Completion report

State where the showcase lives, how to run it, which real components and tokens it reuses, what was verified, what was not verified, and any remaining integration risk.
