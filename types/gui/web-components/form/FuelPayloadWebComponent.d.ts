export type FuelPayloadWebComponentState = {
    fuelMass: number;
    payloadMass: number;
};
export declare class FuelPayloadWebComponent extends HTMLElement {
    elements: {
        fuelMass: HTMLInputElement;
        payloadMass: HTMLInputElement;
    };
    constructor();
    get state(): FuelPayloadWebComponentState;
    connectedCallback(): void;
    handleChange(): void;
    static registerElement(): void;
}
//# sourceMappingURL=FuelPayloadWebComponent.d.ts.map
