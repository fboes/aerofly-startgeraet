import type { ApplicationInformation } from "../../../core/services/getApplicationInformation.js";
import { registerElement } from "../../renderer/registerElement.js";
import { sendToMain } from "../../renderer/sendToMain.js";

export class FooterWebComponent extends HTMLElement {
    private isInitialized = false;

    private initialize() {
        this.setAttribute("aria-role", "footer");
        this.innerHTML = `\
Fuel, payload, runway waypoints, and the starting position cannot be set in this application and must be set in the simulator. Please also see the <a href="#">documentation</a>.
        `;
    }

    async connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        const footerAnchor = this.querySelector("a");
        if (!footerAnchor) {
            return;
        }

        const appInfo = await sendToMain<ApplicationInformation>("application:get-information");

        footerAnchor.innerText = `${appInfo.name} documentation`;
        footerAnchor.href = appInfo.homepage;
    }

    static registerElement() {
        registerElement("startgeraet-footer", FooterWebComponent);
    }
}
