# Showcase architecture

## Goal

Turn the existing product into an explorable inventory of its own interface. The showcase is a development surface, not another source of components.

## Required layers

1. **Inventory** — component exports, token sources, fonts, icons, providers, themes, and runtime constraints.
2. **Catalog** — stable category and page metadata separated from rendering.
3. **Production graph** — imports reachable from the selected runnable production entry.
4. **Scenarios** — small modules that import production roots and only configure deterministic state and external boundaries.
5. **Preview runtime** — an isolated iframe document that boots production CSS, fonts, providers, router, store, and scenario registry.
6. **Shell** — canonical navigation, theme control, responsive split view, error boundary, and iframe container.
7. **Verification** — provenance, transitive coverage, host checks, development and production builds, and browser interaction.

## Catalog contract

Use JSON when the host benefits from deterministic validation. Framework adapters may map the same fields to lazy imports.

```json
{
  "title": "Product UI",
  "scope": {
    "id": "product-ui",
    "environment": "web-development"
  },
  "preview": {
    "adapter": "react-vite",
    "isolation": "iframe",
    "entry": "src/showcase/preview-entry.tsx"
  },
  "groups": [
    {
      "id": "components",
      "title": "Components",
      "items": [
        {
          "id": "button",
          "title": "Button",
          "source": "src/components/Button/Button.showcase.tsx",
          "productionRoot": "src/screens/Settings/SettingsScreen.tsx",
          "kind": "product",
          "states": ["default", "loading", "error"],
          "boundaries": ["http", "local-storage"]
        }
      ]
    }
  ]
}
```

IDs must be lowercase kebab-case and unique across the catalog. `source` must be a repository-relative path and must not point outside the product.
`scope` must exactly match the selected baseline inventory. One catalog represents one application and environment; never merge sibling sources implicitly.
`productionRoot` identifies the production component imported directly by the scenario. `kind` is `foundation`, `primitive`, or `product`. `states` lists the states rendered by the page. `boundaries` lists only external systems replaced for deterministic rendering. A reusable production component is covered when it is reachable from a cataloged root in the selected production graph, or appears in `exclusions` with a concrete reason.

## Scenario contract

A scenario module should expose page metadata and one renderable production root. It may configure named fixtures and boundary responses. Shared production providers belong to the preview entry, not the shell.

A scenario must directly import its declared production root. It must not define visual `Fake`, `Mock`, `Preview`, or `WindowFrame` components, import its own CSS, reproduce product strings, or reconstruct production composition. If the root cannot render without a visual substitute, the integration is incomplete; repair providers or mock the external boundary causing the failure.

Recommended page structure:

- short page title and optional product guidance;
- vertically stacked scenario sections;
- each section labels the state or use case;
- real component instances with realistic content;
- optional narrow-frame preview for responsive behavior.

## Shell behavior

- Wide screens: persistent sidebar and detail canvas.
- Narrow screens: catalog first, then a detail screen with a back action.
- Hash or nested routes must survive refresh and allow direct links.
- Do not add search unless the user explicitly requests it. If requested, filter titles and group names without changing the catalog.
- Theme control must use the host theme mechanism.
- Sidebar scrolling remains available while its scrollbar is visually hidden.
- Detail failures stay isolated through an error boundary.

## Acceptance criteria

- No production component, markup, style, token, string, or composition is copied into the showcase.
- No new visual token is invented when an equivalent host token exists.
- The showcase does not enter the production bundle unless explicitly configured.
- At least one foundation page and three representative component pages render.
- Product-specific components are present whenever the product contains them; primitive-only catalogs are rejected.
- Every baseline inventory component is transitively reached from a cataloged production root or explicitly excluded.
- The shell matches the canonical Mini Apps hierarchy, geometry, token roles, and responsive behavior.
- Direct routes, back navigation, theme switching, and narrow layout work.
- The selected development build and its production web/renderer build pass.
- The browser console has no new errors on representative pages.
- Changing a production component changes the showcase without editing its scenario.
