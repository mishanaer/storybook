# Framework recipes

## React with Vite

Create two alternate entries served by the existing Vite project: `storybook.html` for the immutable shell and `showcase-preview.html` for the product preview. The shell loads the preview URL in an iframe. The preview imports production CSS, fonts, providers, router/store setup, and a registry built with `import.meta.glob` over `*.showcase.{js,jsx,ts,tsx}`. Keep the selected web development and production build modes identical to the product except for external boundary adapters. Read [production-preview.md](production-preview.md).

## Electron renderer with React

Treat the Electron renderer as a React Web surface. Reuse its Vite/Webpack renderer entry, styles, providers, and production roots inside `showcase-preview.html`. Replace only preload/IPC, filesystem, permissions, media devices, hotkeys, and other native boundaries with deterministic adapters. Do not render the BrowserWindow frame or recreate screens as HTML. Run both the renderer development build and packaged/production renderer build.

## React with Webpack or another SPA bundler

Add separate shell and preview HTML entries to the existing multi-entry build. Preserve the production loader chain, CSS order, aliases, compile-time flags, and provider bootstrap in the preview entry. Use the product router only inside the iframe. If multi-entry output is unavailable, serve a development-gated `/showcase-preview` route in an iframe while keeping shell styles in the parent document.

## Next.js

Add a development-gated shell route such as `/showcase/[[...slug]]` and a separate iframe route such as `/showcase-preview/[slug]`. Mount production providers and styles only in the preview route. Use the same App Router or Pages Router generation as the selected product environment. Return `notFound()` outside development unless public exposure is intentional.

## Vue with Vite

Add a route to the existing Vue Router and discover `*.showcase.vue` or scenario modules through `import.meta.glob`. Reuse the app instance plugins and global components. Keep fixtures in scenario modules, not production stores.

## SvelteKit

Create a development-gated `/showcase/[...slug]` route and use a catalog module with explicit dynamic imports. Reuse layouts for fonts and theme, but avoid invoking production loaders that require live data.

## Plain HTML or server-rendered products

Use a separate development entry served by the existing toolchain. Render the catalog and examples with the product's template system or web components. Avoid adding a client framework solely for the showcase.

## Monorepos

Place the shell beside the product that owns the components. Import packages through their public exports unless the showcase intentionally documents internal primitives. Use the monorepo's existing task runner and dependency policy.
