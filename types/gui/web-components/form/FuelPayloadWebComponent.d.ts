import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
export type FuelPayloadWebComponentState = {
    fuelMass: number;
    payloadMass: number;
};
export declare class FuelPayloadWebComponent extends AbstractStateSubscriberWebComponent {
    elements: {
        fuelMass: HTMLInputElement;
        fuelMassMax: HTMLSpanElement;
        payloadMass: HTMLInputElement;
        payloadMassMax: HTMLSpanElement;
    };
    constructor();
    get state(): FuelPayloadWebComponentState;
    connectedCallback(): void;
    handleChange(): void;
    static registerElement(): void;
}
//# sourceMappingURL=FuelPayloadWebComponent.d.ts.map
