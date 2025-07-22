import { Source, effect } from "@rbxts/vide";

const trackSources = new Map<GuiObject, Source<boolean>>();
const parentMap = new Map<GuiObject, GuiObject>(); // child -> parent

export default function track(
    mainComponent: GuiObject,
    parentComponent: GuiObject | undefined,
    visibleSource: Source<boolean>,
    parentVisibleSource?: Source<boolean>,
): Source<boolean> {
    trackSources.set(mainComponent, visibleSource);
    if (parentComponent) parentMap.set(mainComponent, parentComponent);

    effect(() => {
        const isVisible = visibleSource();
        const parentVisible = parentVisibleSource?.();

        if (parentVisibleSource && !parentVisible && isVisible) {
            visibleSource(false);
            return;
        }

        if (isVisible && (parentVisibleSource === undefined || parentVisible)) {
            task.defer(() => {
                for (const [otherComponent, otherSource] of trackSources) {
                    const isChildOfUs = parentMap.get(otherComponent) === mainComponent;

                    if (
                        otherComponent !== mainComponent &&
                        otherComponent !== parentComponent &&
                        !isChildOfUs &&
                        otherSource()
                    ) {
                        otherSource(false);
                    }
                }
            });
        }
    });

    return visibleSource;
}