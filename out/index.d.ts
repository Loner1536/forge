import type * as Types from "./types";
type ForgeModuleAPI = {
    add<TArgs extends unknown[], TParentArgs extends unknown[]>(config: Types.ForgeConfig<TArgs, TParentArgs>): GuiObject;
    render(gui?: GuiObject | ScreenGui): void;
};
declare const Forge: ForgeModuleAPI;
export default Forge;
