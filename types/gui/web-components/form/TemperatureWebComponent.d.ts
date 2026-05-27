import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type TemperatureWebComponentState = {
    temperatureCelsius: number;
};
export declare class TemperatureWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    private initialize;
    get state(): TemperatureWebComponentState;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleChange;
    private setCelsiusFromFahrenheit;
    private setFahrenheitFromCelsius;
    static registerElement(): void;
}
//# sourceMappingURL=TemperatureWebComponent.d.ts.map
