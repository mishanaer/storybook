import { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { addons } from "storybook/preview-api"

import { StorybookShell } from "@mishanaer/butcher/shell"
import {
    Cell,
    ModalView,
    Page,
    PageSkeleton,
    PanelHeader,
    RegularButton,
    SectionList,
    StartView,
    Text,
    useAppearance,
    useSnackbar,
} from "@mishanaer/butcher/mini-app"
import { IconCircleAlert } from "@mishanaer/butcher/primitives/material-symbols-react.js"

import * as styles from "./ButcherStates.example.module.css"

export const MANAGER_NOTIFICATION_EVENT =
    "@mishanaer/butcher/show-manager-notification"
export const CLEAR_MANAGER_NOTIFICATION_EVENT =
    "@mishanaer/butcher/clear-manager-notification"

const MANAGER_NOTIFICATION_ID = "butcher-ui-preview"

const groups = [
    {
        id: "butcher",
        title: "Butcher",
        items: [
            { id: "workspace", title: "Workspace" },
            { id: "loading", title: "Loading" },
            { id: "empty", title: "Empty" },
            { id: "error", title: "Error" },
            { id: "snackbar", title: "Snackbar" },
            { id: "modal", title: "Modal" },
            { id: "manager-notification", title: "Manager Notification" },
        ],
    },
]

const StatusPage = ({ title, description, action }) => (
    <Page>
        <div className={styles.status}>
            <StartView title={title} description={description} />
            {action}
        </div>
    </Page>
)

StatusPage.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    action: PropTypes.node,
}

const WorkspacePreview = () => (
    <Page>
        <SectionList>
            <SectionList.Item header="Preview">
                <Cell>
                    <Cell.Text
                        title="Connected through Butcher"
                        description="The component belongs to the host project."
                    />
                </Cell>
                <Cell>
                    <Cell.Text
                        title="MiniApps chrome"
                        description="Surface, Elevation 1 and shared typography."
                    />
                </Cell>
            </SectionList.Item>
        </SectionList>
    </Page>
)

const ErrorPreview = () => (
    <StatusPage
        title="Preview failed"
        description="The story threw an error before it became ready."
        action={
            <RegularButton
                variant="filled"
                label="Retry preview"
                onClick={() => {}}
            />
        }
    />
)

const EmptyPreview = () => (
    <StatusPage
        title="Nothing to preview"
        description="The project has no stories matching the current catalog."
    />
)

const SnackbarPreview = () => {
    const snackbar = useSnackbar()

    const show = () =>
        snackbar.show({
            position: "bottom",
            duration: 0,
            icon: <IconCircleAlert />,
            title: "Butcher UI is visible",
            description: "Persistent notification for visual review.",
            action: { label: "Dismiss" },
        })

    return (
        <StatusPage
            title="Snackbar"
            description="Shows the real MiniApps notification above the workspace."
            action={
                <RegularButton
                    variant="filled"
                    label="Show snackbar"
                    onClick={show}
                />
            }
        />
    )
}

const ModalPreview = () => {
    const [open, setOpen] = useState(true)

    return (
        <>
            <StatusPage
                title="Modal"
                description="The real MiniApps modal is rendered through its portal."
                action={
                    <RegularButton
                        variant="filled"
                        label="Open modal"
                        onClick={() => setOpen(true)}
                    />
                }
            />
            <ModalView isOpen={open} onClose={() => setOpen(false)}>
                <PanelHeader>Butcher modal</PanelHeader>
                <div className={styles.modalContent}>
                    <Text variant="body">
                        Any modal opened by a project appears above the Butcher
                        workspace.
                    </Text>
                    <RegularButton
                        variant="filled"
                        label="Close"
                        onClick={() => setOpen(false)}
                    />
                </div>
            </ModalView>
        </>
    )
}

const emitManagerNotification = () =>
    addons.getChannel().emit(MANAGER_NOTIFICATION_EVENT, {
        id: MANAGER_NOTIFICATION_ID,
        content: {
            headline: "Butcher manager notification",
            subHeadline: "This is the real Storybook UI above the custom shell.",
        },
        duration: 0,
    })

const ManagerNotificationPreview = () => {
    useEffect(() => {
        emitManagerNotification()
        return () =>
            addons
                .getChannel()
                .emit(CLEAR_MANAGER_NOTIFICATION_EVENT, MANAGER_NOTIFICATION_ID)
    }, [])

    return (
        <StatusPage
            title="Manager notification"
            description="Uses Storybook manager API, not a visual imitation."
            action={
                <RegularButton
                    variant="filled"
                    label="Show manager notification"
                    onClick={emitManagerNotification}
                />
            }
        />
    )
}

const previews = {
    workspace: <WorkspacePreview />,
    loading: <PageSkeleton rows={6} />,
    empty: <EmptyPreview />,
    error: <ErrorPreview />,
    snackbar: <SnackbarPreview />,
    modal: <ModalPreview />,
    "manager-notification": <ManagerNotificationPreview />,
}

const SelfHostedButcher = ({ initialStory = "workspace" }) => {
    const { colorScheme } = useAppearance()
    const [activeId, setActiveId] = useState(initialStory)

    return (
        <StorybookShell
            groups={groups}
            activeId={activeId}
            onSelect={setActiveId}
            onBack={() => setActiveId(null)}
            theme={colorScheme}
        >
            {activeId ? previews[activeId] : null}
        </StorybookShell>
    )
}

SelfHostedButcher.propTypes = {
    initialStory: PropTypes.string,
}

export const ButcherWorkspace = () => <SelfHostedButcher />

export const ButcherCatalog = () => <SelfHostedButcher initialStory={null} />

export const ButcherLoading = () => <SelfHostedButcher initialStory="loading" />

export const ButcherEmpty = () => <SelfHostedButcher initialStory="empty" />

export const ButcherError = () => <SelfHostedButcher initialStory="error" />

export const ButcherSnackbar = () => <SelfHostedButcher initialStory="snackbar" />

export const ButcherModal = () => <SelfHostedButcher initialStory="modal" />

export const ButcherManagerNotification = () => (
    <SelfHostedButcher initialStory="manager-notification" />
)
