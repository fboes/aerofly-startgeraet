import { sendToMain } from "../../renderer/sendToMain.js";
import { SettingsWebComponent } from "../form/SettingsWebComponent.js";
export class HeaderWebComponent extends HTMLElement {
    elements;
    constructor() {
        super();
        SettingsWebComponent.registerElement();
        this.setAttribute("aria-role", "header");
        this.innerHTML = `\
<h1><span>Aerofly Startgerät</span> <small>0.0.0</small></h1>
<startgeraet-settings></startgeraet-settings>
        `;
        this.elements = {
            title: this.querySelector("h1 span"),
            version: this.querySelector("h1 small"),
        };
    }
    async connectedCallback() {
        const applicationName = await sendToMain("application:get-name");
        this.elements.title.textContent = applicationName ?? "Aerofly Startgerät";
        const applicationVersion = await sendToMain("application:get-version");
        this.elements.version.textContent = applicationVersion ?? "";
    }
    static registerElement() {
        customElements.define("startgeraet-header", HeaderWebComponent);
    }
}
