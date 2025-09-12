import { Source, effect } from "@rbxts/vide"

const trackSources = new Map<GuiObject, Source<boolean>>()
const parentMap = new Map<GuiObject, GuiObject>()

export default function track(
    mainComponent: GuiObject,
    parentComponent: GuiObject | undefined,
    visibleSource: Source<boolean>,
    parentVisibleSource?: Source<boolean>
): Source<boolean> {
    trackSources.set(mainComponent, visibleSource)
    if (parentComponent) parentMap.set(mainComponent, parentComponent)

    effect(() => {
        const isVisible = visibleSource()
        const parentVisible = parentVisibleSource?.()

        // Rule 1: Cannot be visible if parent exists and is not visible
        if (parentVisibleSource && !parentVisible && isVisible) {
            visibleSource(false)
            return
        }

        // Rule 2: Cannot be visible if it has children
        for (const [child, childSource] of trackSources) {
            if (parentMap.get(child) === mainComponent && childSource()) {
                if (isVisible) {
                    visibleSource(false)
                }
                return
            }
        }

        // Rule 3: If visible, hide all unrelated siblings
        if (isVisible && (parentVisibleSource === undefined || parentVisible)) {
            task.defer(() => {
                for (const [otherComponent, otherSource] of trackSources) {
                    const isChildOfUs = parentMap.get(otherComponent) === mainComponent

                    if (otherComponent !== mainComponent && otherComponent !== parentComponent && !isChildOfUs && otherSource()) {
                        otherSource(false)
                    }
                }
            })
        }
    })

    return visibleSource
}
