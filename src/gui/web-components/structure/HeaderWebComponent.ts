import { sendToMain } from "../../renderer/sendToMain.js";
import { SettingsWebComponent } from "../form/SettingsWebComponent.js";

export class HeaderWebComponent extends HTMLElement {
    elements: {
        title: HTMLHeadingElement;
    };

    constructor() {
        super();
        SettingsWebComponent.registerElement();

        this.setAttribute("aria-role", "header");
        this.innerHTML = `\
<h1>Aerofly Startgerät</h1>
<startgeraet-settings></startgeraet-settings>
        `;

        this.elements = {
            title: this.querySelector("h1") as HTMLHeadingElement,
        };
    }

    async connectedCallback() {
        const applicationName = await sendToMain<string>("application:get-name");
        this.elements.title.textContent = applicationName ?? "Aerofly Startgerät";
    }

    static registerElement() {
        customElements.define("startgeraet-header", HeaderWebComponent);
    }
}
