# Framework recipes

## React with Vite

Prefer an alternate HTML entry or a development-only route. Install and import the immutable React shell described in [canonical-shell.md](canonical-shell.md). Use `import.meta.glob` for colocated `*.showcase.{js,jsx,ts,tsx}` files when naming is consistent. Mount existing React providers inside the shell's preview boundary. Ensure Vite's checker and linters exclude generated build output.

## Next.js

Add a development-gated route such as `/showcase/[[...slug]]`. Install the immutable React shell inside its client boundary and mount product providers inside the preview boundary. Use dynamic imports for heavy pages. Make the route return `notFound()` in production unless public exposure is intentional.

## Vue with Vite

Add a route to the existing Vue Router and discover `*.showcase.vue` or scenario modules through `import.meta.glob`. Reuse the app instance plugins and global components. Keep fixtures in scenario modules, not production stores.

## SvelteKit

Create a development-gated `/showcase/[...slug]` route and use a catalog module with explicit dynamic imports. Reuse layouts for fonts and theme, but avoid invoking production loaders that require live data.

## Plain HTML or server-rendered products

Use a separate development entry served by the existing toolchain. Render the catalog and examples with the product's template system or web components. Avoid adding a client framework solely for the showcase.

## Monorepos

Place the shell beside the product that owns the components. Import packages through their public exports unless the showcase intentionally documents internal primitives. Use the monorepo's existing task runner and dependency policy.
