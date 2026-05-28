import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type SettingsWebComponentState = {
    mainMcfFilePath: string;
};
export declare class SettingsWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    get state(): SettingsWebComponentState;
    private initialize;
    connectedCallback(): void;
    handleChange: () => Promise<void>;
    static registerElement(): void;
}
//# sourceMappingURL=SettingsWebComponent.d.ts.map
