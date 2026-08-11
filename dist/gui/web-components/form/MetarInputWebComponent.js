import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";
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
<div class="form-group">
    <label for="metar-input" class="header"><startgeraet-icon icon="clipboard"></startgeraet-icon>&nbsp;METAR / TAF</label>
    <textarea id="metar-input" rows="4" placeholder="Enter METAR / TAF string here…"></textarea>
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
        this.subscribeToStateUpdates((state) => {
            this.elements.metar.placeholder = state.metar ?? "Enter METAR / TAF string here…";
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.elements.metar.removeEventListener("input", this.handleChange);
    }
    handleChange = () => {
        sendToMain("metar:set", this.state);
    };
    static registerElement() {
        registerElement("startgeraet-metar-input", MetarInputWebComponent);
    }
}
