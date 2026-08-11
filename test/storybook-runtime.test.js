import test from "node:test";
import assert from "node:assert/strict";
import { groupsFromStorybookIndex, storyEntriesFromIndex } from "../src/storybook-runtime.js";

const index = {
  v: 5,
  entries: {
    "components-button--loading": {
      id: "components-button--loading",
      type: "story",
      title: "Components/Button",
      name: "Loading",
    },
    "components-button--default": {
      id: "components-button--default",
      type: "story",
      title: "Components/Button",
      name: "Default",
    },
    "components-card--default": {
      id: "components-card--default",
      type: "story",
      title: "Components/Card",
      name: "Default",
    },
    "components-button--docs": {
      id: "components-button--docs",
      type: "docs",
      title: "Components/Button",
      name: "Docs",
    },
  },
};

test("storyEntriesFromIndex keeps real stories and ignores docs", () => {
  assert.deepEqual(
    storyEntriesFromIndex(index).map((story) => story.id),
    [
      "components-button--default",
      "components-button--loading",
      "components-card--default",
    ],
  );
});

test("groupsFromStorybookIndex maps Storybook titles to the custom shell", () => {
  assert.deepEqual(groupsFromStorybookIndex(index), [
    {
      id: "components-button",
      title: "Components/Button",
      items: [
        {
          id: "components-button--default",
          title: "Default",
          story: index.entries["components-button--default"],
        },
        {
          id: "components-button--loading",
          title: "Loading",
          story: index.entries["components-button--loading"],
        },
      ],
    },
    {
      id: "components-card",
      title: "Components/Card",
      items: [
        {
          id: "components-card--default",
          title: "Default",
          story: index.entries["components-card--default"],
        },
      ],
    },
  ]);
});
