import { sendToMain } from "../../renderer/sendToMain.js";

export class FooterWebComponent extends HTMLElement {
    private isInitialized = false;

    private elements!: {
        applicationName: HTMLSpanElement;
        applicationVersion: HTMLSpanElement;
    };

    private initialize() {
        this.setAttribute("aria-role", "footer");
        this.innerHTML = `\
<span id="application-name">xxx</span> <span id="application-version">xxx</span> &middot;
<a href="https://github.com/fboes/aerofly-startgeraet">GitHub</a> &middot; &copy; 2026
        `;
        this.elements = {
            applicationName: this.querySelector("#application-name") as HTMLSpanElement,
            applicationVersion: this.querySelector("#application-version") as HTMLSpanElement,
        };
    }

    async connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        this.elements.applicationName.textContent =
            (await sendToMain<string>("application:get-name")) ?? "Aerofly Startgerät";
        this.elements.applicationVersion.textContent =
            (await sendToMain<string>("application:get-version")) ?? "unknown version";
    }

    static registerElement() {
        customElements.define("startgeraet-footer", FooterWebComponent);
    }
}
