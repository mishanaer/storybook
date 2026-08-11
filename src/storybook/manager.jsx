import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  addons,
  types,
  useGlobals,
  useStorybookApi,
  useStorybookState,
} from "storybook/manager-api";

import { StorybookShell } from "../StorybookShell.jsx";
import {
  getInitialStoryId,
  getStoryById,
  storyIndexToGroups,
} from "./adapter.js";

// Storybook's manager builder compiles addon JSX with the classic
// `React.createElement` transform. MiniApps uses automatic JSX in its normal
// Vite build, so expose the same React instance while this manager bundle runs.
globalThis.React ??= React;

const ADDON_ID = "@mishanaer/butcher";
const TAB_ID = `${ADDON_ID}/workspace`;
const THEME_GLOBAL_KEY = "butcherTheme";
const PREVIEW_READY_MESSAGE = `${ADDON_ID}/preview-ready`;
const MANAGER_NOTIFICATION_EVENT = `${ADDON_ID}/show-manager-notification`;
const CLEAR_MANAGER_NOTIFICATION_EVENT = `${ADDON_ID}/clear-manager-notification`;

function readSavedTheme() {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem("butcher-theme") === "dark"
    ? "dark"
    : "light";
}

function getStoryIndex(state) {
  if (state?.index) return state.index;
  if (state?.refs?.storybook?.index) return state.refs.storybook.index;

  const firstRef = state?.refs
    ? Object.values(state.refs).find((ref) => ref?.index)
    : null;
  return firstRef?.index || {};
}

function getPreviewFrame(api, storyId, activeStory, theme) {
  if (!storyId || !activeStory) return null;

  const previewHref = api.getStoryHrefs(storyId, {
    inheritArgs: true,
    inheritGlobals: true,
    viewMode: "story",
  }).previewHref;
  const href = new URL(previewHref, window.location.href);
  href.searchParams.set(THEME_GLOBAL_KEY, theme);
  href.searchParams.set("butcherFrameKey", `${storyId}:${theme}`);

  return {
    key: `${storyId}:${theme}`,
    href: `${href.pathname}${href.search}${href.hash}`,
    title: `${activeStory.storyTitle} — ${activeStory.storyName}`,
  };
}

function BufferedPreview({ api, storyId, story, theme }) {
  const targetFrame = useMemo(
    () => getPreviewFrame(api, storyId, story, theme),
    [api, story, storyId, theme],
  );
  const [activeFrame, setActiveFrame] = useState(targetFrame);
  const [pendingFrame, setPendingFrame] = useState(null);
  const pendingFrameRef = useRef(null);

  useEffect(() => {
    if (!targetFrame) return;

    if (!activeFrame) {
      setActiveFrame(targetFrame);
      return;
    }

    if (targetFrame.key === activeFrame.key) {
      setPendingFrame(null);
      return;
    }

    setPendingFrame(targetFrame);
  }, [activeFrame, targetFrame]);

  const promoteFrame = (frame) => {
    if (frame.key !== targetFrame?.key) return;
    setActiveFrame(frame);
    setPendingFrame(null);
  };

  useEffect(() => {
    if (!pendingFrame) return undefined;

    const handlePreviewReady = (event) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== pendingFrameRef.current?.contentWindow ||
        event.data?.type !== PREVIEW_READY_MESSAGE ||
        event.data?.frameKey !== pendingFrame.key
      ) {
        return;
      }

      promoteFrame(pendingFrame);
    };

    window.addEventListener("message", handlePreviewReady);
    return () => window.removeEventListener("message", handlePreviewReady);
  }, [pendingFrame, targetFrame]);

  return (
    <>
      {activeFrame ? (
        <iframe
          className="storybook-preview-frame is-active"
          key={activeFrame.key}
          title={activeFrame.title}
          src={activeFrame.href}
        />
      ) : null}
      {pendingFrame ? (
        <iframe
          className="storybook-preview-frame is-pending"
          key={pendingFrame.key}
          ref={pendingFrameRef}
          title={pendingFrame.title}
          src={pendingFrame.href}
          onLoad={() => {
            const frame = pendingFrame;
            window.setTimeout(() => promoteFrame(frame), 2000);
          }}
        />
      ) : null}
    </>
  );
}

function ButcherWorkspace() {
  const api = useStorybookApi();
  const state = useStorybookState();
  const [globals, updateGlobals] = useGlobals();
  const storyIndex = getStoryIndex(state);
  const groups = useMemo(() => storyIndexToGroups(storyIndex), [storyIndex]);
  const activeId = useMemo(
    () => getInitialStoryId({ groups, storyId: state.storyId }),
    [groups, state.storyId],
  );
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [savedTheme] = useState(readSavedTheme);
  const themeRestoredRef = useRef(false);
  const theme = globals[THEME_GLOBAL_KEY] === "dark" ? "dark" : "light";

  useEffect(() => {
    if (themeRestoredRef.current) return;
    themeRestoredRef.current = true;
    if (globals[THEME_GLOBAL_KEY] !== savedTheme) {
      updateGlobals({ [THEME_GLOBAL_KEY]: savedTheme });
    }
  }, [globals, savedTheme, updateGlobals]);

  useEffect(() => {
    if (state.storyId) setCatalogOpen(false);
  }, [state.storyId]);

  useEffect(() => {
    window.localStorage.setItem("butcher-theme", theme);
  }, [theme]);

  const activeStory = getStoryById(groups, activeId);

  const selectStory = (storyId) => {
    const story = getStoryById(groups, storyId);
    setCatalogOpen(false);

    if (story && storyId !== state.storyId) {
      api.selectStory(story.storyTitle, story.storyName);
    }
  };

  const goBack = () => {
    setCatalogOpen(true);
  };

  const visibleActiveId = catalogOpen ? null : activeId;

  return (
    <div className="butcher-manager-root">
      <StorybookShell
        groups={groups}
        activeId={visibleActiveId}
        onSelect={selectStory}
        onBack={goBack}
        theme={theme}
        onToggleTheme={() =>
          updateGlobals({
            [THEME_GLOBAL_KEY]: theme === "dark" ? "light" : "dark",
          })
        }
      >
        {!catalogOpen && activeStory ? (
          <BufferedPreview
            api={api}
            storyId={activeId}
            story={activeStory}
            theme={theme}
          />
        ) : null}
      </StorybookShell>
    </div>
  );
}

addons.register(ADDON_ID, (api) => {
  const channel = addons.getChannel();

  channel.on(MANAGER_NOTIFICATION_EVENT, (notification) => {
    api.addNotification(notification);
  });
  channel.on(CLEAR_MANAGER_NOTIFICATION_EVENT, (notificationId) => {
    api.clearNotification(notificationId);
  });

  addons.setConfig({
    layout: {
      showNav: false,
      showToolbar: false,
      showPanel: false,
    },
    ui: {
      enableShortcuts: true,
    },
  });

  addons.add(TAB_ID, {
    type: types.TAB,
    title: "Butcher",
    render: () => React.createElement(ButcherWorkspace),
  });

  queueMicrotask(() => {
    api.setQueryParams({ tab: TAB_ID });
  });
});
