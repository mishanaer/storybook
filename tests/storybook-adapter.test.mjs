import assert from "node:assert/strict"
import test from "node:test"

import {
    flattenStoryGroups,
    getInitialStoryId,
    getStoryById,
    storyIndexToGroups,
} from "../src/storybook/adapter.js"

const index = {
    "button--loading": {
        id: "button--loading",
        type: "story",
        title: "Components/Button",
        name: "Loading",
    },
    "button--default": {
        id: "button--default",
        type: "story",
        title: "Components/Button",
        name: "Default",
    },
    "button--docs": {
        id: "button--docs",
        type: "docs",
        title: "Components/Button",
        name: "Docs",
    },
}

test("turns real Storybook stories into the Butcher catalog", () => {
    const groups = storyIndexToGroups(index)

    assert.deepEqual(groups.map((group) => group.title), ["Components/Button"])
    assert.deepEqual(
        groups[0].items.map((story) => story.title),
        ["Default", "Loading"]
    )
    assert.equal(
        flattenStoryGroups(groups).some((story) => story.id === "button--docs"),
        false
    )
    assert.equal(
        getInitialStoryId({ groups, storyId: "missing" }),
        "button--default"
    )
    assert.equal(getStoryById(groups, "button--loading")?.storyName, "Loading")
})
