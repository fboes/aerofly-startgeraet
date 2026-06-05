import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type MetarImportWebComponentState = {
    icao: string;
};
export declare class MetarImportWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    private initialize;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleClickOrigin;
    private handleClickDestination;
    private sendMetar;
    static registerElement(): void;
}
//# sourceMappingURL=MetarImportWebComponent.d.ts.map