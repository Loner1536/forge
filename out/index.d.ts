import Vide from "@rbxts/vide";
import type { ForgeConfig } from "./types";
export declare class Forge {
    private rendered;
    canvasFolder?: Folder;
    readonly _defaultFadeSpeed: Vide.Source<number>;
    private components;
    constructor(configs: ForgeConfig<any>[], gui: GuiObject | ScreenGui, defaultFadeSpeed?: number);
    private setupComponent;
    /** Get a component by its GuiObject Name */
    get(name: string): GuiObject | undefined;
    /** Update the default fadeSpeed reactively for all components that do not override */
    fadeSpeed(value: number): void;
    private render;
}
