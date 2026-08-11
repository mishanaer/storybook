import test from "node:test";
import assert from "node:assert/strict";
import {
  flattenStoryGroups,
  getInitialStoryId,
  getStoryById,
  storyIndexToGroups,
} from "../src/storybook/adapter.js";

const index = {
  "button--loading": {
    id: "button--loading",
    type: "story",
    title: "Components/Button",
    name: "Loading",
    importPath: "./Button.stories.tsx",
  },
  "button--default": {
    id: "button--default",
    type: "story",
    title: "Components/Button",
    name: "Default",
    importPath: "./Button.stories.tsx",
  },
  "card--default": {
    id: "card--default",
    type: "story",
    title: "Components/Card",
    name: "Default",
    importPath: "./Card.stories.tsx",
  },
  "button--docs": {
    id: "button--docs",
    type: "docs",
    title: "Components/Button",
    name: "Docs",
  },
};

test("converts Storybook index entries into shell groups", () => {
  const groups = storyIndexToGroups(index);
  assert.deepEqual(groups.map((group) => group.title), ["Components/Button", "Components/Card"]);
  assert.deepEqual(groups[0].items.map((story) => story.title), ["Default", "Loading"]);
  assert.equal(groups[0].items[0].storyTitle, "Components/Button");
});

test("ignores non-story index entries", () => {
  const stories = flattenStoryGroups(storyIndexToGroups(index));
  assert.equal(stories.some((story) => story.id === "button--docs"), false);
});

test("resolves current and initial story ids", () => {
  const groups = storyIndexToGroups(index);
  assert.equal(getInitialStoryId({ groups, storyId: "card--default" }), "card--default");
  assert.equal(getInitialStoryId({ groups, storyId: "missing" }), "button--default");
  assert.equal(getStoryById(groups, "button--loading")?.storyName, "Loading");
});
