# Canonical Mini Apps shell

Reproduce the same quiet master-detail shell in every product. The product supplies content and token values; it does not redefine the showcase navigation.

## Wide layout

- Fix the shell to the viewport and split it horizontally.
- Set the sidebar width to `clamp(300px, 33.333%, 440px)`.
- Render the sidebar with the host `surface` token and a subtle right separator.
- Render the detail pane with the host `background` token.
- Keep sidebar and detail scrolling independent. Hide the sidebar scrollbar without disabling scroll.
- Show a centered muted `Select a component` placeholder until a page is selected.

## Catalog

- Put one compact app bar at the top with the title `Storybook` and one icon-only theme toggle.
- Group pages with plain section headers.
- Render each page as one single-line cell using the host's Cell or closest list-row primitive, including its native pressed state, separator, and trailing chevron.
- Keep only the component title in a row. Do not add descriptions, counters, version badges, search, or secondary metadata unless the user explicitly requests them.

## Detail and narrow layout

- Give every detail page its own app bar and product background.
- On narrow screens, show the catalog as the first screen and navigate to a full-width detail screen with a back action.
- Preserve hash or nested routes so direct links and refresh work.
- Use product components only inside scenarios; shell chrome follows this contract even when the host uses another visual language.

## Token binding

Map these roles to existing product tokens without inventing replacements: `surface`, `background`, primary text, secondary text, separator, and pressed fill. If a role is missing, derive it from the nearest semantic host token and document the mapping.

Use `assets/showcase-shell/canonical-shell.css` for geometry and behavior. Rename selectors as needed for the host framework, but keep their resulting layout unchanged.
