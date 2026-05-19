export declare class TemperatureWebComponent extends HTMLElement {
    elements: {
        temperatureCelsius: HTMLInputElement;
        temperatureFahrenheit: HTMLInputElement;
    };
    constructor();
    connectedCallback(): void;
    protected setCelsiusFromFahrenheit(): void;
    protected setFahrenheitFromCelsius(): void;
    static registerElement(): void;
}
//# sourceMappingURL=TemperatureWebComponent.d.ts.map