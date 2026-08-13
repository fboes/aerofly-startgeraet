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

    readonly isTestMode = true;

    constructor() {
        super();
        this.ariaHidden = "true";
    }

    attributeChangedCallback(attributeName: string, oldValue: string, newValue: string) {
        if (attributeName !== "icon" || oldValue === newValue) {
            return;
        }

        const iconMap: { [key: string]: string } = {
            //airplane: "✈️",
            alarm: "⏰",
            //check: "✓",
            //clipboard: "📋", // metar
            //"clipboard-check": "🛫", // flightplan
            //clock: "🕑",
            //"cloud-haze": "🌁",
            //"cloud-sun": "⛅",
            //clouds: "☁️",
            compass: "🧭",
            //folder: "📁",
            //"fuel-pump": "⛽",
            //gear: "⚙️",
            //"hourglass-split": "⏳",
            //info: "ℹ️",
            //"thermometer-half": "🌡️",
            //"three-dots-vertical": "⋮",
            //wind: "🧭",
            //"x": "✗",
        };

        this.innerHTML = iconMap[newValue] ?? this.getHtmlForSvg(newValue);
    }

    private getHtmlForSvg(icon: string) {
        const url = this.isTestMode ? `./icons/${icon}.svg` : `./icons.svg#${icon}`;
        return `<svg width="16" height="16" version="1.1" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><use href="${url}"></svg>`;
    }

    set icon(icon: string) {
        this.setAttribute("icon", icon);
    }

    get icon(): string | null {
        return this.getAttribute("icon");
    }

    static registerElement() {
        registerElement("startgeraet-icon", IconWebComponent);
    }
}
