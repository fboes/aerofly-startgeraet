import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
export declare class FlightplanWebComponent extends AbstractStateSubscriberWebComponent {
    elements: {
        flightplanOrigin: HTMLAnchorElement;
        flightplanDestination: HTMLAnchorElement;
        flightplanDistance: HTMLAnchorElement;
        flightplanTime: HTMLOutputElement;
    };
    constructor();
    connectedCallback(): void;
    static registerElement(): void;
}
//# sourceMappingURL=FlightplanWebComponent.d.ts.map
