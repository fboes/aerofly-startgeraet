import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
export type WindWebComponentState = {
    speed_kts: number;
    gust_kts: number;
    directionInDegree: number;
};
export declare class WindWebComponent extends AbstractStateSubscriberWebComponent {
    elements: {
        windSpeed: HTMLInputElement;
        windGust: HTMLInputElement;
        windDirection: HTMLInputElement;
    };
    constructor();
    get state(): WindWebComponentState;
    connectedCallback(): void;
    handleChange(): void;
    static registerElement(): void;
}
//# sourceMappingURL=WindWebComponent.d.ts.map
