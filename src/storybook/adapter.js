export function storyIndexToGroups(index = {}) {
  const stories = Object.values(index)
    .filter((entry) => entry && entry.type === "story")
    .sort((a, b) => {
      const titleCompare = String(a.title ?? "").localeCompare(String(b.title ?? ""));
      if (titleCompare !== 0) return titleCompare;
      return String(a.name ?? "").localeCompare(String(b.name ?? ""));
    });

  const byTitle = new Map();

  for (const story of stories) {
    const title = story.title || "Stories";
    const id = story.id;
    if (!id) continue;

    if (!byTitle.has(title)) {
      byTitle.set(title, {
        id: `group:${title}`,
        title,
        items: [],
      });
    }

    byTitle.get(title).items.push({
      id,
      title: story.name || id,
      storyTitle: title,
      storyName: story.name || id,
      importPath: story.importPath,
      tags: story.tags || [],
    });
  }

  return Array.from(byTitle.values());
}

export function flattenStoryGroups(groups = []) {
  return groups.flatMap((group) => group.items || []);
}

export function getInitialStoryId({ groups = [], storyId = null } = {}) {
  const stories = flattenStoryGroups(groups);
  if (storyId && stories.some((story) => story.id === storyId)) return storyId;
  return stories[0]?.id ?? null;
}

export function getStoryById(groups = [], storyId) {
  if (!storyId) return null;
  return flattenStoryGroups(groups).find((story) => story.id === storyId) ?? null;
}
