---
name: storybook
description: Build or refresh a lightweight production-faithful component showcase inside an existing React Web, Electron renderer, or other web product. Use when Codex needs to create a component gallery, UI kit browser, design-system showroom, internal Storybook alternative, component catalog, or Mini Apps-style showcase that renders real production roots, providers, styles, themes, and states instead of copied UI.
---

# Storybook

Create the showcase inside the host product. Reuse its runtime, production roots, providers, routing conventions, and build tooling. Render product content in an isolated preview document. Keep the Storybook shell visually isolated and identical to the bundled Mini Apps shell.

## Workflow

1. Inspect repository instructions and the working tree. Preserve unrelated changes.
2. Run `node scripts/discover-surfaces.mjs <repository-root>`. If it finds multiple applications or environments with different component trees, show the concise options and ask the user which source is in scope. Do not combine sources by default. Continue without asking only when one source is unambiguous or the user already named it.
3. Run `node scripts/inventory.mjs <surface-root> --scope <scope-id> --environment <environment> --out <inventory.json>` before creating showcase files. Omit `--environment` only when it does not change the component tree. Keep this baseline inventory until validation is complete.
4. Ask which runnable environment is the source when more than one is plausible: web development, production web build, Electron renderer, desktop development, or another named target. Do not infer a mixed environment. Inspect its production entry, roots, tokens, providers, and routes. Read [references/architecture.md](references/architecture.md).
5. Run `node scripts/production-graph.mjs <surface-root> --entry <production-entry> --out <graph.json>`. Resolve every reported unresolved local import before treating coverage as complete.
6. Choose the adapter in [references/framework-recipes.md](references/framework-recipes.md). For React Web and Electron renderer, use a separate preview HTML entry loaded by the shell through an iframe. The preview entry must import the selected environment's production CSS, fonts, providers, router/store setup, and showcase registry. The shell must not import them.
7. Create a catalog grouped into `Foundations`, `Components`, and product-specific sections. Copy the selected `scope` from the inventory. For every non-foundation page record `source`, `productionRoot`, `kind`, `states`, and `boundaries`. Include every reusable production component transitively through a production root or add it to `exclusions` with a concrete reason.
8. Add one colocated `*.showcase.*` scenario module per documented production root. Import that root directly. Limit the module to controlled state, boundary configuration, and rendering. Never copy markup, styles, tokens, strings, or composition from production.
9. Read [references/canonical-shell.md](references/canonical-shell.md). For React hosts, run `node scripts/install-shell.mjs <product-root> <target-directory>` and integrate the copied `CanonicalStorybookShell.jsx` without editing it or its CSS.
10. Add foundation pages only for primitives that exist in the product. Cover meaningful states through real production roots.
11. Validate with `validate-catalog.mjs`, `validate-scenarios.mjs <surface-root> <catalog.json>`, `validate-coverage.mjs <inventory.json> <catalog.json> <graph.json>`, and `validate-shell.mjs`. Resolve every failure. Run lint, typecheck, tests, the selected development build, and its production renderer/web build.
12. Start the showcase on a free localhost port without replacing another process. Verify both the shell URL and preview iframe URL respond.
13. Open the exact local URL. Visit every scenario and verify navigation, responsive layout, product theme, interactions, and absence of console errors. Compare representative scenarios with the same state in the selected product environment.

## Product rules

- Keep the product as the source of truth. Do not create local token or component substitutes.
- Keep one explicit source scope per catalog. Never silently mix components from sibling apps, packages, legacy trees, generated distributions, or another environment.
- Treat generic primitives as supporting material, not proof of product coverage. When product-specific components exist, a catalog containing only buttons, inputs, switches, cards, skeletons, or loading states is incomplete.
- Render real product workflows and recognizable production roots before polishing primitive pages.
- Keep production bundles unchanged. Load showcase modules only from the showcase entry or development route.
- Do not add Storybook, Ladle, Histoire, or another UI framework unless the user explicitly asks.
- Preserve providers required by real components: theme, localization, router, data clients, portals, and platform adapters.
- Mock only external boundaries: network, Electron IPC, filesystem, permissions, media devices, clipboard, storage, time, randomness, WebSocket, and feature flags. Never mock visual components.
- Keep preview state deterministic. Record every mocked boundary in the catalog.
- Never add showcase-only CSS beside a product scenario. Product appearance must come from production CSS and providers.
- Treat a nested component as covered only when it is reachable from a cataloged `productionRoot` in the selected production import graph.
- Make the first useful screen render even when optional APIs are unavailable.
- Bind the development server to localhost by default. Do not expose it to the local network or the internet unless the user explicitly asks.
- Keep the chosen localhost port stable for the rest of the task. If the server exits, diagnose and restart it on the same port when possible.
- Hide the sidebar scrollbar without disabling scrolling.
- Keep the bundled shell source and CSS unchanged. Do not replace its AppBar, section headers, cells, chevrons, theme action, typography, colors, spacing, or pressed state with host equivalents.
- Do not import host fonts, tokens, resets, utility classes, or UI components into the shell chrome. The shell owns its fixed Mini Apps light and dark tokens.
- Mount host providers and styles only inside the preview boundary. Product typography and tokens must not leak into shell chrome; shell typography and tokens must not override preview content.
- Do not add search, descriptions, version badges, prop tables, or extra toolbar controls unless the user asks.
- Use the canvas background declared by the product inside the preview boundary; never restyle shell chrome to match it.
- Keep controls few and task-oriented. Prefer scenario sections over generic prop tables.

## Bundled resources

- Use `assets/host-files/catalog.example.json` as the portable catalog contract.
- Install `assets/showcase-shell/CanonicalStorybookShell.jsx` and `canonical-shell.css` as immutable shell assets.
- Read `references/architecture.md` for the required information architecture and acceptance criteria.
- Read `references/canonical-shell.md` before implementing or changing the showcase shell.
- Read `references/framework-recipes.md` only for the detected host framework.
- Read `references/production-preview.md` before implementing React Web or Electron renderer previews.

## Completion report

State the selected source application and environment, where the showcase lives, how to run it, the exact localhost URL and selected port, which real components and tokens it reuses, what was verified, what was not verified, and any remaining integration risk.
