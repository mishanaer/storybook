import path from "node:path"
import { fileURLToPath } from "node:url"

const presetPath = fileURLToPath(new URL("../preset.js", import.meta.url))
const frameworkPath = path.dirname(
    fileURLToPath(import.meta.resolve("@storybook/react-vite/package.json"))
)

export function defineButcherConfig(config = {}) {
    const {
        addons = [],
        core = {},
        framework = {
            name: frameworkPath,
            options: {},
        },
        ...rest
    } = config

    return {
        ...rest,
        addons: [presetPath, ...addons],
        framework,
        core: {
            disableTelemetry: true,
            ...core,
        },
    }
}

export default defineButcherConfig
