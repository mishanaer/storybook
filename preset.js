import path from "node:path"
import { fileURLToPath } from "node:url"

import { transformWithEsbuild } from "vite"

const packageRoot = fileURLToPath(new URL(".", import.meta.url))
const previewEntry = fileURLToPath(
    new URL("./src/preview.js", import.meta.url)
)
const managerEntry = fileURLToPath(
    new URL("./src/storybook/manager.jsx", import.meta.url)
)

const automaticJsx = () => ({
    name: "butcher-automatic-jsx",
    enforce: "pre",
    async transform(code, id) {
        const cleanId = id.split("?", 1)[0]
        const extension = path.extname(cleanId)
        const loader = extension === ".tsx"
            ? "tsx"
            : new Set([".js", ".jsx"]).has(extension)
                ? "jsx"
                : null
        if (!loader) return null

        const isButcherSource = cleanId.startsWith(packageRoot)
        const isDependency = cleanId.includes(
            `${path.sep}node_modules${path.sep}`
        )
        if (isDependency && !isButcherSource) return null

        return transformWithEsbuild(code, cleanId, {
            loader,
            jsx: "automatic",
        })
    },
})

const unique = (values) => [...new Set(values.filter(Boolean))]

export function previewAnnotations(entries = []) {
    return [...entries, previewEntry]
}

export function managerEntries(entries = []) {
    return [...entries, managerEntry]
}

export async function viteFinal(config, options = {}) {
    const projectRoot = options.configDir
        ? path.resolve(options.configDir, "..")
        : process.cwd()

    config.plugins = [automaticJsx(), ...(config.plugins ?? [])]
    config.esbuild = {
        ...config.esbuild,
        jsx: "automatic",
    }
    config.resolve = {
        ...config.resolve,
        dedupe: unique([
            ...(config.resolve?.dedupe ?? []),
            "react",
            "react-dom",
            "motion",
        ]),
    }
    config.optimizeDeps = {
        ...config.optimizeDeps,
        exclude: unique(config.optimizeDeps?.exclude ?? []),
        include: unique([
            ...(config.optimizeDeps?.include ?? []),
            "react",
            "react/jsx-runtime",
            "react-dom",
            "react-dom/client",
        ]),
        esbuildOptions: {
            ...config.optimizeDeps?.esbuildOptions,
            loader: {
                ...config.optimizeDeps?.esbuildOptions?.loader,
                ".js": "jsx",
            },
        },
    }
    config.server = {
        ...config.server,
        fs: {
            ...config.server?.fs,
            allow: unique([
                ...(config.server?.fs?.allow ?? []),
                projectRoot,
                packageRoot,
            ]),
        },
    }

    return config
}
