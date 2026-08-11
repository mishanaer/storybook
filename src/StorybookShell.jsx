import React from "react";

import { Cell } from "../mini-app/components/Cells/index.js";
import {
  GlassBorder,
  GlassContainer,
} from "../mini-app/components/GlassEffect/index.js";
import PanelHeader from "../mini-app/components/PanelHeader/index.js";
import SectionHeader from "../mini-app/components/SectionHeader/index.js";
import Text from "../mini-app/components/Text/index.js";
import {
  IconChevronLeft,
  IconChevronRight,
  IconMoon,
  IconSun,
} from "../primitives/material-symbols-react.js";

import "./storybook-shell.css";

export function StorybookShell({
  groups = [],
  activeId = null,
  onSelect,
  onBack,
  theme = "light",
  onToggleTheme,
  children,
}) {
  const items = groups.flatMap((group) => group.items ?? []);
  const activeItem = items.find((item) => item.id === activeId);
  const nextTheme = theme === "dark" ? "light" : "dark";
  const ThemeIcon = theme === "dark" ? IconSun : IconMoon;

  return (
    <div
      className="storybook-shell apple"
      data-mini-app
      data-color-scheme={theme}
      data-selected={activeItem ? "true" : "false"}
    >
      <aside className="storybook-sidebar">
        <div className="storybook-sidebar-scroll">
          <header className="storybook-appbar">
            <GlassContainer className="storybook-appbar-glass">
              <PanelHeader>Butcher</PanelHeader>
              <button
                className="storybook-appbar-action storybook-appbar-trailing"
                type="button"
                onClick={onToggleTheme}
                aria-label={`Switch to ${nextTheme} theme`}
                title={`Switch to ${nextTheme} theme`}
                disabled={!onToggleTheme}
              >
                <GlassBorder muted />
                <ThemeIcon size={24} weight={400} />
              </button>
            </GlassContainer>
          </header>

          <nav className="storybook-catalog" aria-label="Component catalog">
            {groups.map((group) => (
              <section key={group.id}>
                <SectionHeader title={group.title} />
                <div className="storybook-catalog-group">
                  {(group.items ?? []).map((item) => (
                    <Cell
                      key={item.id}
                      as="button"
                      tappable={false}
                      aria-current={
                        activeItem?.id === item.id ? "page" : undefined
                      }
                      end={<IconChevronRight size={20} weight={400} />}
                      onClick={() => onSelect?.(item.id)}
                    >
                      <Cell.Text title={item.title} />
                    </Cell>
                  ))}
                </div>
              </section>
            ))}
          </nav>
        </div>
      </aside>

      <main className="storybook-detail">
        {activeItem ? (
          <>
            <header className="storybook-appbar">
              <GlassContainer className="storybook-appbar-glass">
                <PanelHeader>{activeItem.title}</PanelHeader>
                <button
                  className="storybook-appbar-action storybook-appbar-leading storybook-back-action"
                  type="button"
                  onClick={onBack}
                  aria-label="Back to catalog"
                  title="Back to catalog"
                >
                  <GlassBorder muted />
                  <IconChevronLeft size={24} weight={400} />
                </button>
              </GlassContainer>
            </header>
            <div className="storybook-preview">
              <div className="storybook-preview-content">{children}</div>
            </div>
          </>
        ) : (
          <div className="storybook-placeholder">
            <Text variant="body">Select a component</Text>
          </div>
        )}
      </main>
    </div>
  );
}

export default StorybookShell;
