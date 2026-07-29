import { sendToMain } from "../../renderer/sendToMain.js";
import { SettingsWebComponent } from "../form/SettingsWebComponent.js";
export class HeaderWebComponent extends HTMLElement {
    isInitialized = false;
    elements;
    initialize() {
        SettingsWebComponent.registerElement();
        this.setAttribute("aria-role", "header");
        this.innerHTML = `\
<h1>
    <img src="../../assets/icons/icon.svg" alt="App Icon" width="24" height="24">
    <span>Aerofly Startgerät</span>
    <a href="https://github.com/" target="update" class="version" title="Check for updates">0.0.0</a>
</h1>
<startgeraet-settings></startgeraet-settings>
        `;
        this.elements = {
            title: this.querySelector("h1 span"),
            version: this.querySelector("h1 .version"),
        };
    }
    async connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        const appInfo = await sendToMain("application:get-information");
        this.elements.title.textContent = appInfo.name;
        this.elements.version.textContent = appInfo.version;
        this.elements.version.href = appInfo.github.releaseUrl;
    }
    static registerElement() {
        customElements.define("startgeraet-header", HeaderWebComponent);
    }
}
