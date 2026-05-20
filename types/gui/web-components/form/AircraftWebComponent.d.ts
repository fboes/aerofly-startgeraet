export type AircraftWebComponentState = {
    aircraftName: string;
    aircraftPaintscheme: string;
};
export declare class AircraftWebComponent extends HTMLElement {
    elements: {
        aircraftName: HTMLSelectElement;
        aircraftPaintscheme: HTMLSelectElement;
    };
    constructor();
    get state(): AircraftWebComponentState;
    connectedCallback(): void;
    handleChange(): void;
    static registerElement(): void;
}
//# sourceMappingURL=AircraftWebComponent.d.ts.map
