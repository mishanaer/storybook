# Showcase architecture

## Goal

Turn the existing product into an explorable inventory of its own interface. The showcase is a development surface, not another source of components.

## Required layers

1. **Inventory** — component exports, token sources, fonts, icons, providers, themes, and runtime constraints.
2. **Catalog** — stable category and page metadata separated from rendering.
3. **Scenarios** — small modules that import production components and provide deterministic examples.
4. **Shell** — navigation, search, theme control, responsive split view, error boundary, and preview canvas.
5. **Verification** — catalog integrity, host checks, production build, and browser interaction.

## Catalog contract

Use JSON when the host benefits from deterministic validation. Framework adapters may map the same fields to lazy imports.

```json
{
  "title": "Product UI",
  "scope": {
    "id": "product-ui",
    "environment": "development"
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
          "componentSource": "src/components/Button/Button.tsx",
          "kind": "primitive"
        }
      ]
    }
  ]
}
```

IDs must be lowercase kebab-case and unique across the catalog. `source` must be a repository-relative path and must not point outside the product.
`scope` must exactly match the selected baseline inventory. One catalog represents one application and environment; never merge sibling sources implicitly.
`componentSource` identifies the production component rendered by the scenario. `kind` is `foundation`, `primitive`, or `product`. Every reusable production component from the baseline inventory must appear as a `componentSource` or in the top-level `exclusions` array with a concrete reason.

## Scenario contract

A scenario module should expose page metadata and one renderable page. It may export named fixtures when useful. Keep data local and deterministic. A scenario may wrap components with existing product providers, but the shell should own providers shared by every page.

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

- No production component is copied into the showcase.
- No new visual token is invented when an equivalent host token exists.
- The showcase does not enter the production bundle unless explicitly configured.
- At least one foundation page and three representative component pages render.
- Product-specific components are present whenever the product contains them; primitive-only catalogs are rejected.
- Every baseline inventory component is covered by a catalog item or an explicit justified exclusion.
- The shell matches the canonical Mini Apps hierarchy, geometry, token roles, and responsive behavior.
- Direct routes, back navigation, theme switching, and narrow layout work.
- The host lint or typecheck and production build pass.
- The browser console has no new errors on representative pages.
