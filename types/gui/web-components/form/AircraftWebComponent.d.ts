import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type AircraftWebComponentState = {
    aircraftName: string;
    aircraftPaintscheme: string;
};
export declare class AircraftWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    get state(): AircraftWebComponentState;
    private initialize;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleChange;
    static registerElement(): void;
}
//# sourceMappingURL=AircraftWebComponent.d.ts.map