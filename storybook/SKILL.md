---
name: storybook
description: Build or refresh a lightweight component showcase inside an existing web product by discovering its real components, design tokens, themes, and states. Use when Codex needs to create a component gallery, UI kit browser, design-system showroom, internal Storybook alternative, component catalog, or a Mini Apps-style showcase without introducing a second component library or a heavy standalone documentation framework.
---

# Storybook

Create the showcase inside the host product. Reuse its runtime, production components, providers, routing conventions, and build tooling for scenario content. Keep the Storybook shell visually isolated and identical to the bundled Mini Apps shell.

## Workflow

1. Inspect repository instructions and the working tree. Preserve unrelated changes.
2. Run `node scripts/discover-surfaces.mjs <repository-root>`. If it finds multiple applications or environments with different component trees, show the concise options and ask the user which source is in scope. Do not combine sources by default. Continue without asking only when one source is unambiguous or the user already named it.
3. Run `node scripts/inventory.mjs <surface-root> --scope <scope-id> --environment <environment> --out <inventory.json>` before creating showcase files. Omit `--environment` only when it does not change the component tree. Keep this baseline inventory until validation is complete.
4. Inspect the selected source's entry points, component exports, token sources, providers, and existing routes. Classify every reusable component as a foundation, primitive, or product component. Read [references/architecture.md](references/architecture.md).
5. Choose the least invasive integration described in [references/framework-recipes.md](references/framework-recipes.md). Prefer a product route or alternate dev entry over a separate application.
6. Create a catalog grouped into `Foundations`, `Components`, and product-specific sections. Copy the selected `scope` from the inventory. Record the production `componentSource` and `kind` for every component page. Include every reusable production component or add it to `exclusions` with a concrete reason. Use stable slugs and lazy imports where the host supports them.
7. Add one colocated `*.showcase.*` scenario module per documented component. Import the production component; never duplicate its implementation.
8. Read [references/canonical-shell.md](references/canonical-shell.md). For React hosts, run `node scripts/install-shell.mjs <product-root> <target-directory>` and integrate the copied `CanonicalStorybookShell.jsx` without editing it or its CSS. For other frameworks, port the same DOM, class names, behavior, and CSS mechanically without visual adaptation.
9. Add foundation pages for colors, typography, spacing, radii, icons, and motion only when those primitives exist in the product.
10. Cover meaningful states: default, pressed or active, disabled, loading, error, long content, narrow width, and dark theme where supported.
11. Validate routes and catalog with `node scripts/validate-catalog.mjs <catalog.json>`, coverage and source scope with `node scripts/validate-coverage.mjs <inventory.json> <catalog.json>`, and the installed React shell with `node scripts/validate-shell.mjs <target-directory>`. Resolve every failure. Run the selected environment's lint, typecheck, tests, dev build, and production build when available.
12. Start the showcase on localhost. Use the selected environment's configured or default port when it is free; otherwise select another free port. Never stop, replace, or reuse an unrelated process to claim a port.
13. Wait until the server reports readiness, verify that its HTTP endpoint responds successfully, and leave the server running for the user. Open the exact local URL in a browser and verify navigation, responsive layout, theme inheritance, interactions, and absence of runtime errors.

## Product rules

- Keep the product as the source of truth. Do not create local token or component substitutes.
- Keep one explicit source scope per catalog. Never silently mix components from sibling apps, packages, legacy trees, generated distributions, or another environment.
- Treat generic primitives as supporting material, not proof of product coverage. When product-specific components exist, a catalog containing only buttons, inputs, switches, cards, skeletons, or loading states is incomplete.
- Render real product workflows and recognizable product components before polishing primitive pages.
- Keep production bundles unchanged. Load showcase modules only from the showcase entry or development route.
- Do not add Storybook, Ladle, Histoire, or another UI framework unless the user explicitly asks.
- Preserve providers required by real components: theme, localization, router, data clients, portals, and platform adapters.
- Stub network boundaries, not visual components. Keep fixtures deterministic and local.
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

## Completion report

State the selected source application and environment, where the showcase lives, how to run it, the exact localhost URL and selected port, which real components and tokens it reuses, what was verified, what was not verified, and any remaining integration risk.
