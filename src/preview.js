import { createElement, useEffect } from "react";

import "./preview.css";

const COLOR_SCHEMES = new Set(["light", "dark"]);
const PREVIEW_READY_MESSAGE = "@mishanaer/butcher/preview-ready";

function PreviewReady({ Story, frameKey }) {
  useEffect(() => {
    let cancelled = false;

    const notifyReady = async () => {
      await document.fonts?.ready;
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (cancelled) return;
          window.parent.postMessage(
            { type: PREVIEW_READY_MESSAGE, frameKey },
            window.location.origin,
          );
        });
      });
    };

    notifyReady();
    return () => {
      cancelled = true;
    };
  }, [frameKey]);

  return createElement(Story);
}

function getRequestedColorScheme(context) {
  if (typeof window !== "undefined") {
    const requestedColorScheme = new URLSearchParams(
      window.location.search,
    ).get("butcherTheme");
    if (COLOR_SCHEMES.has(requestedColorScheme)) return requestedColorScheme;
  }

  const globalColorScheme = context?.globals?.butcherTheme;
  return COLOR_SCHEMES.has(globalColorScheme) ? globalColorScheme : undefined;
}

export const decorators = [
  (Story, context) => {
    const colorScheme = getRequestedColorScheme(context);
    const frameKey =
      typeof window === "undefined"
        ? undefined
        : new URLSearchParams(window.location.search).get("butcherFrameKey");

    if (colorScheme && typeof document !== "undefined") {
      document.documentElement.dataset.colorScheme = colorScheme;
      document.documentElement.style.setProperty(
        "--tg-color-scheme",
        colorScheme,
      );
    }

    return createElement(PreviewReady, { Story, frameKey });
  },
];

export const initialGlobals = {
  butcherTheme: "light",
};

export const parameters = {
  layout: "fullscreen",
  controls: { expanded: true },
  options: {
    storySort: {
      order: ["Butcher", "Primitives", "Components", "Screens"],
    },
  },
};
