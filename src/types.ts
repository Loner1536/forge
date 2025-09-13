// Types
import type { Node } from "@rbxts/vide"
import type { Source } from "@rbxts/vide"

export type TrackedWindow = {
    visible: Source<boolean>
    children: Record<string, Source<boolean>>
}

export type ForgeConfig<TArgs extends unknown[] = unknown[]> = {
    component: (...args: TArgs) => GuiObject | Node
    visible: Source<boolean>
    fadeSpeed?: number
    window?: boolean
    zIndex?: number
    args?: TArgs
    fullyClosed?: () => void
    children?: ForgeConfig<any>[]
}
