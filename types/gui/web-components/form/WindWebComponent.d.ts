import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type WindWebComponentState = {
    speed_kts: number;
    gust_kts: number;
    directionInDegree: number;
};
export declare class WindWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    private initialize;
    get state(): WindWebComponentState;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleChange;
    static registerElement(): void;
}
//# sourceMappingURL=WindWebComponent.d.ts.map
