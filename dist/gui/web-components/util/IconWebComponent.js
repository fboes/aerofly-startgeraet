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
        const iconMap = {
            alarm: "⏰",
            airplane: "✈️",
            check: "✓",
            clipboard: "📋", // metar
            "clipboard-check": "🛫", // flightplan
            clock: "🕑",
            "cloud-haze": "🌁",
            "cloud-sun": "⛅",
            clouds: "☁️",
            compass: "🧭",
            folder: "📁",
            "fuel-pump": "⛽",
            gear: `<svg width="16" height="16" version="1.1" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><use href="./icons.svg"></svg>`,
            "hourglass-split": "⏳",
            info: "ℹ️",
            "thermometer-half": "🌡️",
            "three-dots-vertical": "⋮",
            wind: "🧭",
            "x  ": "✗",
        };
        if (!iconMap[newValue]) {
            throw new Error(`Unknown icon "${newValue}"`);
        }
        this.innerHTML = iconMap[newValue];
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
