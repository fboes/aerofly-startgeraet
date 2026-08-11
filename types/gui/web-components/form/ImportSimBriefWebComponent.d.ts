import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type ImportSimBriefWebComponentState = {
    simBriefUserName: string;
    useSimBriefWeather: number;
};
export declare class ImportSimBriefWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private shortcut;
    private elements;
    private initialize;
    get state(): ImportSimBriefWebComponentState;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleClick;
    static registerElement(): void;
}
//# sourceMappingURL=ImportSimBriefWebComponent.d.ts.map