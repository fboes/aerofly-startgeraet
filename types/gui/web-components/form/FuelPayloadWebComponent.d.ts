import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type FuelPayloadWebComponentState = {
    fuelMass: number;
    payloadMass: number;
};
export declare class FuelPayloadWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    private weightProPerson_kg;
    private initialize;
    get state(): FuelPayloadWebComponentState;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleRangeChange;
    private handleChange;
    private numberFormat;
    static registerElement(): void;
}
//# sourceMappingURL=FuelPayloadWebComponent.d.ts.map