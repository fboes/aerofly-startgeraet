import { sendToMain } from "../../renderer/sendToMain.js";
export class FooterWebComponent extends HTMLElement {
    elements;
    constructor() {
        super();
        this.setAttribute("aria-role", "footer");
        this.innerHTML = `\
<span id="application-name">xxx</span> <span id="application-version">xxx</span> &middot;
<a href="https://github.com/fboes/aerofly-startgeraet">GitHub</a> &middot; &copy; 2026
        `;
        this.elements = {
            applicationName: this.querySelector("#application-name"),
            applicationVersion: this.querySelector("#application-version"),
        };
    }
    async connectedCallback() {
        this.elements.applicationName.textContent =
            (await sendToMain("application:get-name")) ?? "Aerofly Startgerät";
        this.elements.applicationVersion.textContent =
            (await sendToMain("application:get-version")) ?? "unknown version";
    }
    static registerElement() {
        customElements.define("startgeraet-footer", FooterWebComponent);
    }
}
