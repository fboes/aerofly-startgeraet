export class FooterWebComponent extends HTMLElement {
    private isInitialized = false;

    private initialize() {
        this.setAttribute("aria-role", "footer");
        this.innerHTML = `\
Please be aware that this application cannot set fuel, payload, runway waypoints, as well as starting position in the simulator. You must set these values manually in the simulator before starting a flight.
        `;
    }

    async connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
    }

    static registerElement() {
        customElements.define("startgeraet-footer", FooterWebComponent);
    }
}
