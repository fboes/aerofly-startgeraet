export declare class AircraftWebComponent extends HTMLElement {
    elements: {
        aircraftName: HTMLSelectElement;
        aircraftPaintscheme: HTMLSelectElement;
    };
    constructor();
    connectedCallback(): void;
    protected setAircraft(aeroflyCode: string, paintscheme?: string): void;
    static registerElement(): void;
}
//# sourceMappingURL=AircraftWebComponent.d.ts.map