#!/usr/bin/env node

import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

const help = `Butcher — Storybook with deslop primitives and Mini App UI

Usage:
  butcher dev [Storybook options]
  butcher build [Storybook options]

Examples:
  butcher dev -p 6006
  butcher build -o storybook-static
`

const input = process.argv.slice(2)
if (input.includes("--help") || input.includes("-h")) {
    process.stdout.write(help)
    process.exit(0)
}

const command = input[0] ?? "dev"
if (!new Set(["dev", "build"]).has(command)) {
    process.stderr.write(`Unknown command: ${command}\n\n${help}`)
    process.exit(1)
}

const storybookBin = fileURLToPath(
    import.meta.resolve("storybook/internal/bin/dispatcher")
)
const args = [command, ...input.slice(1)]

if (command === "dev") {
    if (!args.includes("--no-open") && !args.includes("--open")) {
        args.push("--no-open")
    }
    if (!args.includes("--port") && !args.includes("-p")) {
        args.push("--port", "6006")
    }
}

const child = spawn(process.execPath, [storybookBin, ...args], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
})

child.on("error", (error) => {
    process.stderr.write(`Unable to start Storybook: ${error.message}\n`)
    process.exit(1)
})

child.on("exit", (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal)
        return
    }
    process.exit(code ?? 1)
})
