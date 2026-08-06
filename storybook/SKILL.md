---
name: storybook
description: Build or refresh a lightweight component showcase inside an existing web product by discovering its real components, design tokens, themes, and states. Use when Codex needs to create a component gallery, UI kit browser, design-system showroom, internal Storybook alternative, component catalog, or a Mini Apps-style showcase without introducing a second component library or a heavy standalone documentation framework.
---

# Storybook

Create the showcase from the host product, not beside it. Reuse its runtime, components, tokens, fonts, providers, routing conventions, and build tooling.

## Workflow

1. Inspect repository instructions and the working tree. Preserve unrelated changes.
2. Run `node scripts/inventory.mjs <product-root> --out <inventory.json>` from this skill directory before creating showcase files. Keep this baseline inventory until validation is complete.
3. Inspect the detected entry points, component exports, token sources, providers, and existing routes. Classify every reusable component as a foundation, primitive, or product component. Read [references/architecture.md](references/architecture.md).
4. Choose the least invasive integration described in [references/framework-recipes.md](references/framework-recipes.md). Prefer a product route or alternate dev entry over a separate application.
5. Create a catalog grouped into `Foundations`, `Components`, and product-specific sections. Record the production `componentSource` and `kind` for every component page. Include every reusable production component or add it to `exclusions` with a concrete reason. Use stable slugs and lazy imports where the host supports them.
6. Add one colocated `*.showcase.*` scenario module per documented component. Import the production component; never duplicate its implementation.
7. Read [references/canonical-shell.md](references/canonical-shell.md) and reproduce that shell. Use `assets/showcase-shell/canonical-shell.css` as the layout baseline. Adapt product token and component bindings, but do not redesign the catalog shell.
8. Add foundation pages for colors, typography, spacing, radii, icons, and motion only when those primitives exist in the product.
9. Cover meaningful states: default, pressed or active, disabled, loading, error, long content, narrow width, and dark theme where supported.
10. Validate routes and catalog with `node scripts/validate-catalog.mjs <catalog.json>` and coverage with `node scripts/validate-coverage.mjs <inventory.json> <catalog.json>` when using the JSON contract. Resolve every uncovered component. Run the host lint, typecheck, tests, and production build.
11. Start the showcase on localhost. Use the product's configured or default port when it is free; otherwise select another free port. Never stop, replace, or reuse an unrelated process to claim a port.
12. Wait until the server reports readiness, verify that its HTTP endpoint responds successfully, and leave the server running for the user. Open the exact local URL in a browser and verify navigation, responsive layout, theme inheritance, interactions, and absence of runtime errors.

## Product rules

- Keep the product as the source of truth. Do not create local token or component substitutes.
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
- Keep the canonical Mini Apps information architecture and geometry for the shell. Do not add search, descriptions, version badges, prop tables, or extra toolbar controls unless the user asks.
- Bind the shell to host tokens for `surface`, `background`, text, separators, and pressed states. Do not let a host component library change the shell's hierarchy, spacing, row treatment, or navigation behavior.
- Use the canvas background token declared by the host product; never hardcode light or dark canvas colors.
- Keep controls few and task-oriented. Prefer scenario sections over generic prop tables.

## Bundled resources

- Use `assets/host-files/catalog.example.json` as the portable catalog contract.
- Use `assets/showcase-shell/canonical-shell.css` as the shell layout baseline.
- Read `references/architecture.md` for the required information architecture and acceptance criteria.
- Read `references/canonical-shell.md` before implementing or changing the showcase shell.
- Read `references/framework-recipes.md` only for the detected host framework.

## Completion report

State where the showcase lives, how to run it, the exact localhost URL and selected port, which real components and tokens it reuses, what was verified, what was not verified, and any remaining integration risk.
