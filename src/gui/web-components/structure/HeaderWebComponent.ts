import { sendToMain } from "../../renderer/sendToMain.js";
import { SettingsWebComponent } from "../form/SettingsWebComponent.js";

export class HeaderWebComponent extends HTMLElement {
    private isInitialized = false;

    private elements!: {
        title: HTMLHeadingElement;
        version: HTMLElement;
    };

    private initialize() {
        SettingsWebComponent.registerElement();

        this.setAttribute("aria-role", "header");
        this.innerHTML = `\
<h1><span>Aerofly Startgerät</span> <small>0.0.0</small></h1>
<startgeraet-settings></startgeraet-settings>
        `;

        this.elements = {
            title: this.querySelector("h1 span") as HTMLHeadingElement,
            version: this.querySelector("h1 small") as HTMLElement,
        };
    }

    async connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        const applicationName = await sendToMain<string>("application:get-name");
        this.elements.title.textContent = applicationName ?? "Aerofly Startgerät";

        const applicationVersion = await sendToMain<string>("application:get-version");
        this.elements.version.textContent = applicationVersion ?? "";
    }

    static registerElement() {
        customElements.define("startgeraet-header", HeaderWebComponent);
    }
}
