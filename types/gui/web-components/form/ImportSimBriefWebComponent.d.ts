import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type ImportSimBriefWebComponentState = {
    simBriefUserName: string;
    simBriefWeatherFromDestination: boolean;
};
export declare class ImportSimBriefWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    private initialize;
    get state(): ImportSimBriefWebComponentState;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleClick;
    static registerElement(): void;
}
//# sourceMappingURL=ImportSimBriefWebComponent.d.ts.map