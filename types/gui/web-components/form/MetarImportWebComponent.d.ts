import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type MetarImportWebComponentState = {
    icao: string;
};
export declare class MetarImportWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private shortcut;
    private elements;
    private initialize;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private isButtonDisabled;
    private handleClickOrigin;
    private handleClickDestination;
    private sendMetar;
    static registerElement(): void;
}
//# sourceMappingURL=MetarImportWebComponent.d.ts.map