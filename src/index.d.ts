/// <reference types="@rbxts/vide" />

import type { ForgeConfig } from "./types"

declare namespace ForgeModule {
    type AddFunction = <TArgs extends unknown[], TParentArgs extends unknown[]>(
        config: ForgeConfig<TArgs, TParentArgs>
    ) => GuiObject

    type RenderFunction = (gui?: GuiObject | ScreenGui) => void

    interface ForgeModuleAPI {
        add: AddFunction
        render: RenderFunction
    }
}

/**
 * The Forge module allows for rendering animated UI components with parent-child relationships
 * and spring-based visibility effects.
 */
declare const Forge: ForgeModule.ForgeModuleAPI

export = Forge
