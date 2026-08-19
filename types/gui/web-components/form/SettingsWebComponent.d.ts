import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import type { ConfigTheme } from "../../../core/io/Config.js";
export type SettingsWebComponentState = {
    mainMcfFilePath: string;
    theme: ConfigTheme;
    fontSizePercent: number;
};
export declare class SettingsWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    get state(): SettingsWebComponentState;
    private initialize;
    connectedCallback(): void;
    disconnectedCallback(): void;
    handleChange: () => Promise<void>;
    handlePathChooserClick: () => Promise<void>;
    static registerElement(): void;
}
//# sourceMappingURL=SettingsWebComponent.d.ts.map