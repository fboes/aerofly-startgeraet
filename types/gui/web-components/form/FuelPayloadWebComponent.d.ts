import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type FuelPayloadWebComponentState = {
    fuelMass: number;
    payloadMass: number;
};
export declare class FuelPayloadWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    private initialize;
    get state(): FuelPayloadWebComponentState;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleChange;
    static registerElement(): void;
}
//# sourceMappingURL=FuelPayloadWebComponent.d.ts.map