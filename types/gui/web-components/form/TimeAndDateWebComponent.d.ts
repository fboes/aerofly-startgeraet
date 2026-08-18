import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type TimeAndDateWebComponentState = {
    utcDate: string;
    utcTime: string;
};
export declare class TimeAndDateWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private shortcut;
    private readonly shortcutKey;
    private elements;
    private initialize;
    get state(): TimeAndDateWebComponentState;
    get utcDate(): Date;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private checkWarning;
    private handleChange;
    private setLocalFromUtc;
    private setUtcFromLocal;
    private setNow;
    private pad;
    static registerElement(): void;
}
//# sourceMappingURL=TimeAndDateWebComponent.d.ts.map