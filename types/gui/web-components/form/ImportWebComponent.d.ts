export type ImportWebComponentPayload = {
    flightplans: string[];
    filepath: string;
};
export declare class ImportWebComponent extends HTMLElement {
    private isInitialized;
    private elements;
    private initialize;
    connectedCallback(): void;
    disconnectedCallback(): void;
    handleClick: () => Promise<void>;
    static registerElement(): void;
}
//# sourceMappingURL=ImportWebComponent.d.ts.map