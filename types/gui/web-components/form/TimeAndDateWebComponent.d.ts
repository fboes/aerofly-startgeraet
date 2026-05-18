export declare class TimeAndDateWebComponent extends HTMLElement {
    elements: {
        dateUtc: HTMLInputElement;
        timeUtc: HTMLInputElement;
        dateLocal: HTMLInputElement;
        timeLocal: HTMLInputElement;
        timeZoneLocal: HTMLElement;
    };
    constructor();
    connectedCallback(): void;
    protected setLocalFromUtc(): void;
    protected setUtcFromLocal(): void;
    protected pad(t: string | number): string;
    static registerElement(): void;
}
//# sourceMappingURL=TimeAndDateWebComponent.d.ts.map
