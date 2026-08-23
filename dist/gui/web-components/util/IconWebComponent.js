import { registerElement } from "../../renderer/registerElement.js";
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
export class IconWebComponent extends HTMLElement {
    static observedAttributes = ["icon"];
    constructor() {
        super();
        this.ariaHidden = "true";
    }
    attributeChangedCallback(attributeName, oldValue, newValue) {
        if (attributeName !== "icon" || oldValue === newValue) {
            return;
        }
        this.innerHTML = this.getHtmlForSvg(newValue);
    }
    getHtmlForSvg(icon) {
        const url = `./icons.svg#${icon}`;
        return `<svg class="icon"><use href="${url}"></svg>`;
    }
    set icon(icon) {
        this.setAttribute("icon", icon);
    }
    get icon() {
        return this.getAttribute("icon");
    }
    static registerElement() {
        registerElement("startgeraet-icon", IconWebComponent);
    }
}
