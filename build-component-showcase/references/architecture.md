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
  "groups": [
    {
      "id": "components",
      "title": "Components",
      "items": [
        {
          "id": "button",
          "title": "Button",
          "source": "src/components/Button/Button.showcase.tsx"
        }
      ]
    }
  ]
}
```

IDs must be lowercase kebab-case and unique across the catalog. `source` must be a repository-relative path and must not point outside the product.

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
- Search filters titles and group names without changing the catalog.
- Theme control must use the host theme mechanism.
- Sidebar scrolling remains available while its scrollbar is visually hidden.
- Detail failures stay isolated through an error boundary.

## Acceptance criteria

- No production component is copied into the showcase.
- No new visual token is invented when an equivalent host token exists.
- The showcase does not enter the production bundle unless explicitly configured.
- At least one foundation page and three representative component pages render.
- Direct routes, back navigation, search, theme switching, and narrow layout work.
- The host lint or typecheck and production build pass.
- The browser console has no new errors on representative pages.
