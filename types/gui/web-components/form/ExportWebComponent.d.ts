export declare class ExportWebComponent extends HTMLElement {
    private isInitialized;
    private shortcut;
    private readonly shortcutKey;
    private elements;
    private initialize;
    connectedCallback(): void;
    disconnectedCallback(): void;
    handleClick: () => Promise<void>;
    static registerElement(): void;
}
//# sourceMappingURL=ExportWebComponent.d.ts.map