import React, { useEffect, useMemo, useState } from "react";
import { StorybookShell } from "./StorybookShell.jsx";
import {
  getStorybookIndexUrl,
  getStorybookPreviewUrl,
  groupsFromStorybookIndex,
  readStoryIdFromLocation,
  storyEntriesFromIndex,
  writeStoryIdToLocation,
} from "./storybook-runtime.js";

export function StorybookPreview({ storybookUrl = "/", storyId, title }) {
  if (!storyId) return null;

  return (
    <iframe
      key={storyId}
      className="storybook-core-preview-frame"
      src={getStorybookPreviewUrl(storybookUrl, storyId)}
      title={title ? `${title} preview` : "Story preview"}
    />
  );
}

export function StorybookRuntime({
  storybookUrl = "/storybook/",
  theme: controlledTheme,
  onThemeChange,
  storyParam = "story",
  fetchImpl = globalThis.fetch,
}) {
  const [index, setIndex] = useState(null);
  const [error, setError] = useState(null);
  const [internalTheme, setInternalTheme] = useState("light");
  const [activeId, setActiveId] = useState(() => readStoryIdFromLocation(storyParam));

  const theme = controlledTheme ?? internalTheme;
  const groups = useMemo(() => groupsFromStorybookIndex(index), [index]);
  const stories = useMemo(() => storyEntriesFromIndex(index), [index]);
  const activeStory = stories.find((story) => story.id === activeId) ?? null;

  useEffect(() => {
    let cancelled = false;

    async function loadIndex() {
      try {
        setError(null);
        const response = await fetchImpl(getStorybookIndexUrl(storybookUrl));
        if (!response.ok) throw new Error(`Storybook index request failed with ${response.status}`);
        const nextIndex = await response.json();
        if (cancelled) return;
        setIndex(nextIndex);

        const requested = readStoryIdFromLocation(storyParam);
        const available = storyEntriesFromIndex(nextIndex);
        const selected = available.find((story) => story.id === requested)?.id ?? available[0]?.id ?? null;
        setActiveId(selected);
        writeStoryIdToLocation(selected, storyParam, { replace: true });
      } catch (nextError) {
        if (!cancelled) setError(nextError);
      }
    }

    loadIndex();
    return () => {
      cancelled = true;
    };
  }, [fetchImpl, storyParam, storybookUrl]);

  useEffect(() => {
    const onPopState = () => setActiveId(readStoryIdFromLocation(storyParam));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [storyParam]);

  function selectStory(id) {
    setActiveId(id);
    writeStoryIdToLocation(id, storyParam);
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    if (controlledTheme == null) setInternalTheme(nextTheme);
    onThemeChange?.(nextTheme);
  }

  if (error) {
    return <div className="storybook-runtime-status">{error.message}</div>;
  }

  if (!index) {
    return <div className="storybook-runtime-status">Loading stories…</div>;
  }

  return (
    <StorybookShell
      groups={groups}
      activeId={activeId}
      onSelect={selectStory}
      onBack={() => {
        setActiveId(null);
        writeStoryIdToLocation(null, storyParam);
      }}
      theme={theme}
      onToggleTheme={toggleTheme}
    >
      <StorybookPreview storybookUrl={storybookUrl} storyId={activeId} title={activeStory?.title} />
    </StorybookShell>
  );
}

export default StorybookRuntime;
