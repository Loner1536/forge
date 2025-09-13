// Packages
import Vide from "@rbxts/vide"

// Types
import type { ForgeConfig } from "./types"

// Components
import track from "./track"

const { source, mount, apply, effect, spring } = Vide

function setupCanvasComponent<TArgs extends unknown[]>(forge: Forge, cfg: ForgeConfig<TArgs>, parent?: GuiObject): GuiObject {
    assert(cfg.component, "[Forge] 'component' is required in config")
    assert(cfg.visible, "[Forge] 'visible' source is required in config")

    const component = cfg.component
    const componentArgs = cfg.args ?? []
    const visibleSource = cfg.visible

    const mainComponent = component(...(componentArgs as TArgs)) as GuiObject

    // If parent was passed, mount under it later
    if (cfg.window && parent) {
        track(mainComponent, parent, cfg.visible, cfg.visible)
    }

    const springVisibility = spring(() => (visibleSource() ? 0 : 1), cfg.fadeSpeed ? cfg.fadeSpeed : 0.25, 0.8)
    const isSpringOpen = source(false)
    const wasFullyClosed = source(false)

    task.defer(() => {
        const containPosInHierarchy = mainComponent.Parent
        mount(() => {
            const canvas = (
                <canvasgroup
                    Name={mainComponent.Name}
                    BackgroundTransparency={1}
                    GroupTransparency={springVisibility}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    Position={UDim2.fromScale(0.5, 0.5)}
                    Size={UDim2.fromScale(1, 1)}
                    Interactable={false}
                    ZIndex={() => {
                        if (visibleSource() && cfg.zIndex) return cfg.zIndex
                        if (visibleSource() && cfg.window) return 3
                        if (!visibleSource() && cfg.window) return 2
                        return 1
                    }}
                    Parent={forge.canvasFolder}
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
                    mainComponent.Parent = canvas
                } else if (visible && isSpringOpen()) {
                    mainComponent.Parent = containPosInHierarchy
                }
            })

            return canvas
        })

        mainComponent.Parent = mainComponent.Parent ?? forge.canvasFolder
    })

    apply(mainComponent)({
        Visible: () => springVisibility() < 0.9,
        ZIndex: () => {
            if (visibleSource() && cfg.zIndex) return cfg.zIndex
            if (visibleSource() && cfg.window) return 3
            if (!visibleSource() && cfg.window) return 2
            return 1
        }
    })

    // Recursively set up children
    if (cfg.children) {
        for (const child of cfg.children) {
            setupCanvasComponent(forge, child, mainComponent)
        }
    }

    return mainComponent
}

export default class Forge {
    private rendered = false
    public canvasFolder?: Folder
    private components: Record<string, GuiObject> = {}

    constructor(configs: ForgeConfig<any>[], gui: GuiObject | ScreenGui) {
        this.render(gui)

        for (const cfg of configs) {
            this.setupComponent(cfg)
        }
    }

    private setupComponent(cfg: ForgeConfig<any>, parent?: GuiObject) {
        const comp = setupCanvasComponent(this, cfg, parent)

        this.components[comp.Name] = comp

        if (cfg.children) {
            for (const child of cfg.children) {
                this.setupComponent(child, comp)
            }
        }

        return comp
    }

    public get(name: string): GuiObject | undefined {
        return this.components[name]
    }

    private render(gui: GuiObject | ScreenGui) {
        assert(!this.rendered, "[Forge.render] Cannot be called more than once per Forge instance.")
        assert(gui, "[Forge.render] A GuiObject or ScreenGui must be provided.")
        if (!gui.IsA("GuiObject") && !gui.IsA("ScreenGui")) {
            error("[Forge.render] Argument must be a GuiObject or ScreenGui.")
        }

        this.rendered = true
        this.canvasFolder = (<folder Name={"CanvasGroup Fades"} Parent={gui} />) as Folder
    }
}
