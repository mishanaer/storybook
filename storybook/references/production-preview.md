# Production-faithful preview

Use this contract for React Web and Electron renderer integrations.

## Runtime boundary

Serve two documents from the host build:

1. `storybook.html` or `/showcase` owns only the immutable Mini Apps shell.
2. `showcase-preview.html` or `/showcase-preview/:slug` owns the selected product runtime.

Load the second document in an iframe. Communicate the slug, theme, viewport, and deterministic state through URL parameters or `postMessage`. Do not import product resets, fonts, tokens, or providers into the parent document.

## Preview bootstrap

Build the preview entry from the same inputs as the selected production environment:

- production global CSS and font loading in the same order;
- theme, localization, router, store, query client, portals, notifications, and error boundaries;
- compile-time environment flags and module aliases;
- a registry of scenario modules loaded only by the preview entry.

Keep providers in a reusable production bootstrap when one already exists. If the application bootstrap is inseparable from DOM mounting, compose the same exported providers in the preview entry without changing their implementation.

## Scenario boundary

A `*.showcase.tsx` module may:

- import one production root directly;
- seed existing stores or pass supported production props;
- install deterministic adapters for external systems;
- enumerate named states and render the root.

It must not:

- copy JSX, HTML, CSS, tokens, product strings, or component composition;
- define visual components named or serving as `Fake`, `Mock`, `Preview`, or `WindowFrame`;
- replace child components to make the page resemble production;
- add styling that exists only in the showcase.

## Allowed mocks

Mock systems beyond the renderer: HTTP and GraphQL, Electron preload/IPC, filesystem, OS permissions, microphone/camera, clipboard, localStorage/IndexedDB when isolation requires it, time, randomness, WebSocket, notifications, and feature flags. Record every mocked boundary in `catalog.json`.

Do not mock React components, hooks that encode presentation, design tokens, layout, typography, or interaction logic. Prefer the production data client with a local transport adapter over a replacement view model.

## Provenance and coverage

Generate `graph.json` from the selected production entry. A scenario declares its direct `productionRoot`; all reachable inventory components are transitively covered. A component found only in a showcase file does not count. Any inventory component not reached from a root needs an explicit exclusion reason.

## Verification

Run, in order:

1. catalog, scenario, graph, coverage, and immutable-shell validators;
2. lint/typecheck/tests for the selected environment;
3. selected development build and production web/renderer build;
4. browser smoke for every scenario in light/dark and narrow/wide modes when supported;
5. console-error check and a comparison with the same production state.

The strongest drift test is simple: change a visible production value temporarily, rebuild, and confirm the showcase changes without editing its scenario. Revert the temporary change after verification.
