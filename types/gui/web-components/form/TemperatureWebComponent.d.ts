import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
export type TemperatureWebComponentState = {
    temperatureCelsius: number;
};
export declare class TemperatureWebComponent extends AbstractStateSubscriberWebComponent {
    elements: {
        temperatureCelsius: HTMLInputElement;
        temperatureFahrenheit: HTMLInputElement;
    };
    constructor();
    get state(): TemperatureWebComponentState;
    connectedCallback(): void;
    handleChange(): void;
    protected setCelsiusFromFahrenheit(): void;
    protected setFahrenheitFromCelsius(): void;
    static registerElement(): void;
}
//# sourceMappingURL=TemperatureWebComponent.d.ts.map
