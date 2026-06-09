import type { ImportWebComponentPayload } from "./ImportWebComponent.js";
export type FlightPlanChooserWebComponentState = {
    flightPlanIndex: number;
    filepath: string;
};
export declare class FlightPlanChooserWebComponent extends HTMLElement {
    private isInitialized;
    private elements;
    get state(): FlightPlanChooserWebComponentState;
    set values(values: ImportWebComponentPayload);
    private initialize;
    open(): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    handleChange: () => Promise<void>;
    static registerElement(): void;
}
//# sourceMappingURL=FlightPlanChooserWebComponent.d.ts.map