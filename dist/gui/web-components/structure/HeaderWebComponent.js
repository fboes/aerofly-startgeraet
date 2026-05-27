import { sendToMain } from "../../renderer/sendToMain.js";
import { SettingsWebComponent } from "../form/SettingsWebComponent.js";
export class HeaderWebComponent extends HTMLElement {
    isInitialized = false;
    elements;
    initialize() {
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
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        const applicationName = await sendToMain("application:get-name");
        this.elements.title.textContent = applicationName ?? "Aerofly Startgerät";
        const applicationVersion = await sendToMain("application:get-version");
        this.elements.version.textContent = applicationVersion ?? "";
    }
    static registerElement() {
        customElements.define("startgeraet-header", HeaderWebComponent);
    }
}
