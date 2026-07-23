import { HeaderWebComponent } from "./HeaderWebComponent.js";
import { MainWebComponent } from "./MainWebComponent.js";
import { NotificationWebComponent } from "../util/NotificationWebComponent.js";
import { FooterWebComponent } from "./FooterWebComponent.js";

export class AppWebComponent extends HTMLElement {
    private isInitialized = false;

    private initialize() {
        NotificationWebComponent.registerElement();
        HeaderWebComponent.registerElement();
        MainWebComponent.registerElement();
        FooterWebComponent.registerElement();

        this.classList.add("platform-" + window.process.platform);
        this.innerHTML = `\
<startgeraet-notification></startgeraet-notification>
<startgeraet-header></startgeraet-header>
<startgeraet-main></startgeraet-main>
<startgeraet-footer></startgeraet-footer>
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
