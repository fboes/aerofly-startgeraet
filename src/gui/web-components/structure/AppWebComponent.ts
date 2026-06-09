import { HeaderWebComponent } from "./HeaderWebComponent.js";
import { MainWebComponent } from "./MainWebComponent.js";
import { NotificationWebComponent } from "../util/NotificationWebComponent.js";

export class AppWebComponent extends HTMLElement {
    private isInitialized = false;

    private initialize() {
        NotificationWebComponent.registerElement();
        HeaderWebComponent.registerElement();
        MainWebComponent.registerElement();

        this.classList.add("platform-" + window.process.platform);
        this.innerHTML = `\
<startgeraet-notification></startgeraet-notification>
<startgeraet-header></startgeraet-header>
<startgeraet-main></startgeraet-main>
        `;
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
    }

    static registerElement() {
        customElements.define("startgeraet-app", AppWebComponent);
    }
}
