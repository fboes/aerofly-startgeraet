import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export class MetarInputWebComponent extends AbstractStateSubscriberWebComponent {
    isInitialized = false;
    elements;
    get state() {
        return {
            metar: this.elements.metar.value,
        };
    }
    intialize() {
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>METAR</h3>
<div class="form-group">
    <label for="metar-input">METAR string</label>
    <textarea id="metar-input" rows="4" placeholder="Enter METAR string here..."></textarea>
</div>
        `;
        this.elements = {
            metar: this.querySelector("#metar-input"),
        };
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.intialize();
            this.isInitialized = true;
        }
        this.elements.metar.addEventListener("input", this.handleChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.elements.metar.removeEventListener("input", this.handleChange);
    }
    handleChange = () => {
        sendToMain("metar:set", this.state);
    };
    static registerElement() {
        customElements.define("startgeraet-metar-input", MetarInputWebComponent);
    }
}
