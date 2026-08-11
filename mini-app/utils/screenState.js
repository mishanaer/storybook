const screens = new Map()

export function currentScreenPath() {
    if (typeof window === "undefined") return "/"
    return `${window.location.pathname}${window.location.search}`
}

export function getScreenState(path, key) {
    return screens.get(path)?.get(key)
}

export function setScreenState(path, key, value) {
    let state = screens.get(path)

    if (!state) {
        state = new Map()
        screens.set(path, state)
    }

    state.set(key, value)
}

export function clearScreenState(path) {
    if (path === undefined) screens.clear()
    else screens.delete(path)
}
