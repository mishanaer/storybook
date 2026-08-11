import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { promises as fs } from "node:fs"
import path from "node:path"

const repository = path.resolve(import.meta.dirname, "..")
const fixture = path.join(repository, "tests/fixtures/react-project")
const output = path.join(repository, ".cache/integration-storybook")

await fs.rm(output, { recursive: true, force: true })

await new Promise((resolve, reject) => {
    const child = spawn(
        process.execPath,
        [path.join(repository, "bin/butcher.mjs"), "build", "-o", output],
        {
            cwd: fixture,
            stdio: "inherit",
        }
    )

    child.on("error", reject)
    child.on("exit", (code) => {
        if (code === 0) resolve()
        else reject(new Error(`Integration Storybook exited with code ${code}`))
    })
})

const index = JSON.parse(
    await fs.readFile(path.join(output, "index.json"), "utf8")
)
const stories = Object.values(index.entries).filter(
    (entry) => entry.type === "story"
)

assert.deepEqual(
    stories.map(({ id, title, name }) => ({ id, title, name })),
    [
        {
            id: "external-project-button--default",
            title: "External Project/Button",
            name: "Default",
        },
    ]
)

const css = await fs.readFile(
    path.join(fixture, "src/TargetButton.css"),
    "utf8"
)
assert.match(css, /var\(--accent-green\)/)
assert.match(css, /var\(--ui-radius-22\)/)

const managerBundleDirectory = path.join(output, "sb-addons")
const managerBundleFiles = []
for (const directory of await fs.readdir(managerBundleDirectory)) {
    const candidate = path.join(
        managerBundleDirectory,
        directory,
        "manager-bundle.js"
    )
    try {
        managerBundleFiles.push(await fs.readFile(candidate, "utf8"))
    } catch (error) {
        if (error.code !== "ENOENT") throw error
    }
}

assert.match(managerBundleFiles.join("\n"), /butcherFrameKey/)
assert.doesNotMatch(managerBundleFiles.join("\n"), /butcherStory/)
assert.match(managerBundleFiles.join("\n"), /butcherTheme/)
assert.match(managerBundleFiles.join("\n"), /Component catalog/)

process.stdout.write(
    "External project component built inside the Butcher manager shell.\n"
)
