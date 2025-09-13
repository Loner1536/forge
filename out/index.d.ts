import type { ForgeConfig } from "./types";
export default class Forge {
    private rendered;
    canvasFolder?: Folder;
    private components;
    constructor(configs: ForgeConfig<any>[], gui: GuiObject | ScreenGui);
    private setupComponent;
    get(name: string): GuiObject | undefined;
    private render;
}
