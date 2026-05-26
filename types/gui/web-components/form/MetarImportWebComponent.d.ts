export type MetarImportWebComponentState = {
    icao: string;
};
export declare class MetarImportWebComponent extends HTMLElement {
    elements: {
        metarOrigin: HTMLButtonElement;
        metarDestination: HTMLButtonElement;
        dialog: HTMLDialogElement;
    };
    constructor();
    connectedCallback(): void;
    sendMetar(icao: string): Promise<void>;
    static registerElement(): void;
}
//# sourceMappingURL=MetarImportWebComponent.d.ts.map
