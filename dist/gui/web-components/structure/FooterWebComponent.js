import { registerElement } from "../../renderer/registerElement.js";
export class FooterWebComponent extends HTMLElement {
    isInitialized = false;
    initialize() {
        this.setAttribute("aria-role", "footer");
        this.innerHTML = `\
Fuel, payload, runway waypoints, and the starting position cannot be set in this application and must be set in the simulator.
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
