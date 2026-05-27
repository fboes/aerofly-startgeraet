import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type ImportSimBriefWebComponentState = {
    simBriefUserName: string;
};
export declare class ImportSimBriefWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    private initialize;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleClick;
    static registerElement(): void;
}
//# sourceMappingURL=ImportSimBriefWebComponent.d.ts.map
