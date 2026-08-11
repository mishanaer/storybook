import React, { useEffect, useMemo, useState } from "react";
import { addons, types, useStorybookApi, useStorybookState } from "storybook/manager-api";
import { StorybookShell } from "../StorybookShell.jsx";
import { getInitialStoryId, getStoryById, storyIndexToGroups } from "./adapter.js";
import "../storybook-shell.css";

const ADDON_ID = "@mishanaer/storybook-shell";
const TAB_ID = `${ADDON_ID}/workspace`;
const STORY_QUERY_KEY = "shellStory";

function readSavedTheme() {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem("mishanaer-storybook-theme") === "dark" ? "dark" : "light";
}

function getStoryIndex(state) {
  if (state?.index) return state.index;
  if (state?.refs?.storybook?.index) return state.refs.storybook.index;

  const firstRef = state?.refs ? Object.values(state.refs).find((ref) => ref?.index) : null;
  return firstRef?.index || {};
}

function StorybookWorkspace() {
  const api = useStorybookApi();
  const state = useStorybookState();
  const storyIndex = getStoryIndex(state);
  const groups = useMemo(() => storyIndexToGroups(storyIndex), [storyIndex]);
  const queryStoryId = api.getQueryParam(STORY_QUERY_KEY);
  const [activeId, setActiveId] = useState(() => queryStoryId || state.storyId || null);
  const [theme, setTheme] = useState(readSavedTheme);

  useEffect(() => {
    const next = getInitialStoryId({ groups, storyId: queryStoryId || state.storyId || activeId });
    if (next && next !== activeId) setActiveId(next);
  }, [groups, queryStoryId, state.storyId]);

  useEffect(() => {
    if (!activeId) return;
    api.setQueryParams({ [STORY_QUERY_KEY]: activeId, tab: TAB_ID });
  }, [activeId, api]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mishanaer-storybook-theme", theme);
    }
  }, [theme]);

  const activeStory = getStoryById(groups, activeId);
  const previewHref = activeId
    ? api.getStoryHrefs(activeId, {
        inheritArgs: true,
        inheritGlobals: true,
        viewMode: "story",
      }).previewHref
    : null;

  const selectStory = (storyId) => {
    const story = getStoryById(groups, storyId);
    setActiveId(storyId);

    if (story) {
      api.selectStory(story.storyTitle, story.storyName);
      queueMicrotask(() => api.setQueryParams({ [STORY_QUERY_KEY]: storyId, tab: TAB_ID }));
    }
  };

  const goBack = () => {
    setActiveId(null);
    api.setQueryParams({ [STORY_QUERY_KEY]: null, tab: TAB_ID });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2147483647 }}>
      <StorybookShell
        groups={groups}
        activeId={activeId}
        onSelect={selectStory}
        onBack={goBack}
        theme={theme}
        onToggleTheme={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
      >
        {previewHref && activeStory ? (
          <iframe
            key={previewHref}
            title={`${activeStory.storyTitle} — ${activeStory.storyName}`}
            src={previewHref}
            style={{ display: "block", width: "100%", height: "100%", minHeight: "calc(100vh - 64px)", border: 0 }}
          />
        ) : null}
      </StorybookShell>
    </div>
  );
}

addons.register(ADDON_ID, (api) => {
  addons.setConfig({
    showNav: false,
    showToolbar: false,
    showPanel: false,
    enableShortcuts: true,
  });

  addons.add(TAB_ID, {
    type: types.TAB,
    title: "Storybook",
    render: StorybookWorkspace,
  });

  queueMicrotask(() => {
    api.setQueryParams({ tab: TAB_ID });
  });
});
