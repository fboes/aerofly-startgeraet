import { HeaderWebComponent } from "./HeaderWebComponent.js";
import { MainWebComponent } from "./MainWebComponent.js";
import { NotificationWebComponent } from "./NotificationWebComponent.js";

export class AppWebComponent extends HTMLElement {
    constructor() {
        super();

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

    static registerElement() {
        customElements.define("startgeraet-app", AppWebComponent);
    }
}
