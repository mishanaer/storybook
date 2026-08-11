export function normalizeStorybookUrl(url = "/") {
  return url.endsWith("/") ? url : `${url}/`;
}

export function getStorybookIndexUrl(storybookUrl = "/") {
  return new URL("index.json", new URL(normalizeStorybookUrl(storybookUrl), window.location.href)).toString();
}

export function getStorybookPreviewUrl(storybookUrl = "/", storyId) {
  const base = new URL("iframe.html", new URL(normalizeStorybookUrl(storybookUrl), window.location.href));
  if (storyId) {
    base.searchParams.set("id", storyId);
    base.searchParams.set("viewMode", "story");
  }
  return base.toString();
}

export function storyEntriesFromIndex(index) {
  const entries = Object.values(index?.entries ?? {});
  return entries
    .filter((entry) => entry?.type === "story")
    .sort((a, b) => {
      const title = String(a.title ?? "").localeCompare(String(b.title ?? ""));
      return title || String(a.name ?? a.id).localeCompare(String(b.name ?? b.id));
    });
}

export function groupsFromStorybookIndex(index) {
  const byTitle = new Map();

  for (const entry of storyEntriesFromIndex(index)) {
    const title = entry.title || "Stories";
    const items = byTitle.get(title) ?? [];
    items.push({
      id: entry.id,
      title: entry.name || entry.id,
      story: entry,
    });
    byTitle.set(title, items);
  }

  return Array.from(byTitle, ([title, items]) => ({
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "stories",
    title,
    items,
  }));
}

export function readStoryIdFromLocation(param = "story") {
  if (typeof window === "undefined") return null;
  return new URL(window.location.href).searchParams.get(param);
}

export function writeStoryIdToLocation(storyId, param = "story", { replace = false } = {}) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (storyId) url.searchParams.set(param, storyId);
  else url.searchParams.delete(param);

  window.history[replace ? "replaceState" : "pushState"]({}, "", url);
}
