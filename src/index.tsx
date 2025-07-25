// Packages
import Vide from "@rbxts/vide"

// Types
import type * as Types from "./types"

// Components
import track from "./track"

// Vide Components
const { source, mount, apply, effect, spring } = Vide

// Module variables
let rendered = false
let canvasFolder: Folder | undefined

interface ForgeModuleAPI {
    add<TArgs extends unknown[], TParentArgs extends unknown[]>(
        config: Types.ForgeConfig<TArgs, TParentArgs>
    ): GuiObject
    render(gui?: GuiObject | ScreenGui): void
}

function setupCanvasComponent<
    TArgs extends unknown[],
    TParentArgs extends unknown[]
>(cfg: Types.ForgeConfig<TArgs, TParentArgs>): GuiObject {
    assert(cfg.component, "[Forge Setup] 'component' is required in config")
    assert(cfg.visible, "[Forge Setup] 'visible' source is required in config")
    assert(cfg.args, "[Forge Setup] 'args' is required in config")

    const component = cfg.component
    const componentArgs = cfg.args ?? []
    const parentConfig = cfg.parent
    const visibleSource = cfg.visible
    const parentComponent = parentConfig?.component
    const parentArgs = parentConfig?.args ?? []

    const mainComponent = component(...(componentArgs as TArgs)) as GuiObject

    if (cfg.window)
        track(
            mainComponent,
            parentConfig?.original,
            cfg.visible,
            parentConfig?.visible
        )

    let parentClone: GuiObject | undefined
    if (parentComponent) {
        parentClone = parentComponent(
            ...(parentArgs as TParentArgs)
        ) as GuiObject
        parentClone?.GetChildren().forEach((child) => child.Destroy())
    }

    let canvas: CanvasGroup

    const springVisibility = spring(
        () => (visibleSource() ? 0 : 1),
        cfg.fadeSpeed,
        0.8
    )
    const isSpringOpen = source(false)
    const wasFullyClosed = source(false)

    task.defer(() => {
        const containPosInHierarchy = mainComponent.Parent
        mount(() => {
            canvas = (
                <canvasgroup
                    Name={mainComponent.Name}
                    BackgroundTransparency={1}
                    GroupTransparency={springVisibility}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    Position={UDim2.fromScale(0.5, 0.5)}
                    Size={UDim2.fromScale(1, 1)}
                    Interactable={false}
                    ZIndex={() => {
                        if (cfg.popup) return 5
                        if (cfg.parent) return 2
                        if (visibleSource() && cfg.window) return 3
                        if (!visibleSource() && cfg.window) return 2
                        return 1
                    }}
                    Parent={canvasFolder}
                />
            ) as CanvasGroup

            effect(() => {
                const vis = springVisibility()
                const visible = visibleSource()

                if (vis < 0.3) {
                    isSpringOpen(true)
                    wasFullyClosed(false)
                } else {
                    isSpringOpen(false)
                }

                if (vis >= 1 && !wasFullyClosed()) {
                    wasFullyClosed(true)
                    if (cfg.fullyClosed) {
                        task.spawn(cfg.fullyClosed)
                    }
                }

                if (!visible) {
                    mainComponent.Parent = parentClone ?? canvas
                } else if (visible && isSpringOpen()) {
                    mainComponent.Parent =
                        parentConfig?.original ?? containPosInHierarchy
                }
            })

            return canvas
        })

        if (parentClone) {
            parentClone.Name = "Parent Imitation"
            parentClone.Parent = canvas!
            mainComponent.Parent = parentClone
        } else {
            mainComponent.Parent = canvas!
        }
    })

    apply(mainComponent)({
        Visible: () => springVisibility() < 0.9,
        ZIndex: () => {
            if (cfg.popup) return 5
            if (cfg.parent) return mainComponent.ZIndex
            if (visibleSource() && cfg.window) return 3
            if (!visibleSource() && cfg.window) return 2
            return 1
        }
    })

    return mainComponent
}

const Forge: ForgeModuleAPI = {
    add<TArgs extends unknown[], TParentArgs extends unknown[]>(
        config: Types.ForgeConfig<TArgs, TParentArgs>
    ): GuiObject {
        assert(
            typeIs(config, "table"),
            "[Forge] Expected a config table as the first argument."
        )
        assert(
            rendered,
            "[Forge] Forge.render() must be called before creating components."
        )
        assert(
            canvasFolder,
            "[Forge] canvasFolder not initialized. Call Forge.render() first."
        )

        return setupCanvasComponent(config)
    },

    render(gui?: GuiObject | ScreenGui): void {
        assert(
            !rendered,
            "[Forge.render] Forge.render() cannot be called more than once."
        )
        assert(gui, "[Forge.render] A GuiObject or ScreenGui must be provided.")
        if (!gui.IsA("GuiObject") && !gui.IsA("ScreenGui")) {
            error("[Forge.render] Argument must be a GuiObject or ScreenGui.")
        }

        rendered = true
        canvasFolder = (
            <folder Name={"CanvasGroup Fades"} Parent={gui} />
        ) as Folder
    }
}

export default Forge
