import { registerElement } from "../util/registerElement.js";

export class FooterWebComponent extends HTMLElement {
    private isInitialized = false;

    private initialize() {
        this.setAttribute("aria-role", "footer");
        this.innerHTML = `\
This application cannot set fuel, payload, runway waypoints, and the starting position in the simulator correctly. You must set these values manually in the simulator before starting a flight.
        `;
    }

    async connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
    }

    static registerElement() {
        registerElement("startgeraet-footer", FooterWebComponent);
    }
}
