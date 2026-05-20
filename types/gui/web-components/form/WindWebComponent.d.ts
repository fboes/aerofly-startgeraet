export type WindWebComponentState = {
    speed_kts: number;
    gust_kts: number;
    directionInDegree: number;
};
export declare class WindWebComponent extends HTMLElement {
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
