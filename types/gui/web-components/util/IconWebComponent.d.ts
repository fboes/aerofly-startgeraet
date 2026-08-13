/**
 * Create icon, e.g. emoji character or inline SVG.
 *
 * Usage:
 *
 * ```html
 * <startgeraet-icon icon="info"></startgeraet-icon>
 * ```
 *
 * Naming of `icon` property is supposed to be compatible with Bootstrap Icons.
 *
 * @see https://icons.getbootstrap.com/
 */
export declare class IconWebComponent extends HTMLElement {
    static observedAttributes: string[];
    constructor();
    attributeChangedCallback(attributeName: string, oldValue: string, newValue: string): void;
    private getHtmlForSvg;
    set icon(icon: string);
    get icon(): string | null;
    static registerElement(): void;
}
//# sourceMappingURL=IconWebComponent.d.ts.map