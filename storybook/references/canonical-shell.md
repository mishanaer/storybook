# Canonical Mini Apps shell

Use the bundled shell as immutable product infrastructure, not as a visual reference to reinterpret.

## Installation

For React hosts, run:

```bash
node scripts/install-shell.mjs <product-root> <target-directory>
```

Import `CanonicalStorybookShell.jsx` from that directory. Pass catalog groups, the active item, navigation callbacks, theme state, and the preview node. Do not edit the installed JSX or CSS. Run `node scripts/validate-shell.mjs <target-directory>` after integration.

For Vue, Svelte, or plain HTML, port the bundled DOM and state transitions mechanically. Copy `canonical-shell.css` unchanged and preserve every class name and `data-*` attribute.

## Isolation boundary

- Everything rendered by `CanonicalStorybookShell` except `.storybook-preview-content` is shell chrome.
- Shell chrome always uses the bundled Mini Apps typography, light and dark colors, spacing, radii, separators, icons, and pressed states.
- Never import host UI controls or apply host utility classes to shell chrome.
- Mount host providers, resets, fonts, and theme classes at `.storybook-preview-content` or below.
- Product components may look exactly like the product; the catalog around them must not.

## Fixed behavior

- Wide: persistent `clamp(300px, 33.333%, 440px)` sidebar and detail pane.
- Narrow: catalog first, then a full-width detail screen with back action.
- App bar: centered `Storybook` title, one icon-only theme action.
- Catalog: plain section headers and single-line cells with separators and trailing chevrons.
- Empty detail: centered `Select a component` label.
- Sidebar scrolling remains enabled while its scrollbar stays hidden.
- Hash or nested routes remain the host adapter's responsibility.

Descriptions, search, counters, version badges, prop tables, and extra toolbar actions are absent unless the user explicitly requests them.
