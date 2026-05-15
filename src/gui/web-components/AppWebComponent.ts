import { FooterWebComponent } from "./FooterWebComponent.js";
import { HeaderWebComponent } from "./HeaderWebComponent.js";
import { MainWebComponent } from "./MainWebComponent.js";

export class AppWebComponent extends HTMLElement {
    constructor() {
        super();

        HeaderWebComponent.registerElement();
        MainWebComponent.registerElement();
        FooterWebComponent.registerElement();

        this.innerHTML = `\
<startgeraet-header></startgeraet-header>
<startgeraet-main></startgeraet-main>
<startgeraet-footer></startgeraet-footer>
        `;
    }

    static registerElement() {
        customElements.define("startgeraet-app", AppWebComponent);
    }
}
