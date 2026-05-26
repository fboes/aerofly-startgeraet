import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
export type TimeAndDateWebComponentState = {
    utcDate: string;
    utcTime: string;
};
export declare class TimeAndDateWebComponent extends AbstractStateSubscriberWebComponent {
    elements: {
        dateUtc: HTMLInputElement;
        timeUtc: HTMLInputElement;
        dateLocal: HTMLInputElement;
        timeLocal: HTMLInputElement;
        timeZoneLocal: HTMLElement;
        nowButton: HTMLButtonElement;
    };
    constructor();
    get state(): TimeAndDateWebComponentState;
    connectedCallback(): void;
    handleChange(): void;
    protected setLocalFromUtc(): void;
    protected setUtcFromLocal(): void;
    protected setNow(): void;
    protected pad(t: string | number): string;
    static registerElement(): void;
}
//# sourceMappingURL=TimeAndDateWebComponent.d.ts.map
