import { createElement } from "react"

import {
    ButcherCatalog,
    ButcherEmpty,
    ButcherError,
    ButcherLoading,
    ButcherManagerNotification,
    ButcherModal,
    ButcherSnackbar,
    ButcherWorkspace,
} from "../examples/butcher/ButcherStates.example"

export default { title: "Butcher" }

const story = (Component) => ({ render: () => createElement(Component) })

export const Workspace = story(ButcherWorkspace)
export const Catalog = story(ButcherCatalog)
export const Loading = story(ButcherLoading)
export const Empty = story(ButcherEmpty)
export const Error = story(ButcherError)
export const Snackbar = story(ButcherSnackbar)
export const Modal = story(ButcherModal)
export const ManagerNotification = story(ButcherManagerNotification)
