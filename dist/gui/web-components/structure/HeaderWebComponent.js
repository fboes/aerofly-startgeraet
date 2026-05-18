import { SettingsWebComponent } from "../form/SettingsWebComponent.js";
export class HeaderWebComponent extends HTMLElement {
    elements;
    constructor() {
        super();
        SettingsWebComponent.registerElement();
        this.setAttribute("aria-role", "header");
        this.innerHTML = `\
<h1>Aerofly Startgerät</h1>
<startgeraet-settings></startgeraet-settings>
        `;
        this.elements = {
            title: this.querySelector("h1"),
        };
    }
    async connectedCallback() {
        this.elements.title.textContent =
            (await window.applicationService?.getApplicationName()) ?? "Aerofly Startgerät";
    }
    static registerElement() {
        customElements.define("startgeraet-header", HeaderWebComponent);
    }
}
