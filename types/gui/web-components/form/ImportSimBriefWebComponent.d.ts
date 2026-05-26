export type ImportSimBriefWebComponentState = {
    simBriefUserName: string;
};
export declare class ImportSimBriefWebComponent extends HTMLElement {
    elements: {
        simBriefUserName: HTMLInputElement;
        importSimBrief: HTMLButtonElement;
        dialog: HTMLDialogElement;
    };
    constructor();
    connectedCallback(): void;
    private handleClick;
    static registerElement(): void;
}
//# sourceMappingURL=ImportSimBriefWebComponent.d.ts.map
