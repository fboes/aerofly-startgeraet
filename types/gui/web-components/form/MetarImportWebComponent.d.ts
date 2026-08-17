import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type MetarImportWebComponentState = {
    icao: string;
};
export declare class MetarImportWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private shortcut;
    private readonly shortcutKey;
    static readonly METAR_FETCH_LIMIT_DAYS_PAST = 28;
    static readonly TAF_FETCH_LIMIT_DAYS_FUTURE = 28;
    private elements;
    private initialize;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private setTitle;
    /**
     * If the date is in the future, we need to fetch TAF instead of METAR,
     * because METAR is only available for the past.
     */
    private isTafRequired;
    private isButtonDisabled;
    private getDate;
    private handleClickOrigin;
    private handleClickDestination;
    private sendMetar;
    static registerElement(): void;
}
//# sourceMappingURL=MetarImportWebComponent.d.ts.map