import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../util/registerElement.js";
export class VisibilityWebComponent extends AbstractStateSubscriberWebComponent {
    isInitialized = false;
    elements;
    initialize() {
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<div class="d-flex">
    <div class="form-group">
        <label for="visibility-sm" class="header"><startgeraet-icon icon="cloud-haze"></startgeraet-icon>&nbsp;Visibility</label>
        <span class="input-group">
            <input id="visibility-sm" type="number" min="0" step="0.25" value="10" />
            <span>SM</span>
        </span>
    </div>
    <div class="form-group">
        <label for="visibility-meters">Visibility m</label>
        <span class="input-group">
            <input id="visibility-meters" type="number" min="0" step="100" value="9999" />
            <span>m</span>
        </span>
    </div>
</div>
        `;
        this.elements = {
            visibilitySm: this.querySelector("#visibility-sm"),
            visibilityMeters: this.querySelector("#visibility-meters"),
        };
    }
    get state() {
        return {
            visibilityMeters: this.elements.visibilityMeters.valueAsNumber || 0,
        };
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        this.elements.visibilitySm.addEventListener("input", this.setMetersFromSm);
        this.elements.visibilityMeters.addEventListener("input", this.setSmFromMeters);
        this.setSmFromMeters();
        this.subscribeToStateUpdates((state) => {
            this.elements.visibilityMeters.valueAsNumber = Math.round(state.aeroflyFlight.visibility_meter);
            this.setSmFromMeters();
        });
        this.addEventListener("input", this.handleChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.elements.visibilitySm.removeEventListener("input", this.setMetersFromSm);
        this.elements.visibilityMeters.removeEventListener("input", this.setSmFromMeters);
        this.removeEventListener("input", this.handleChange);
    }
    handleChange = () => {
        sendToMain("visibility:set", this.state);
    };
    setMetersFromSm = () => {
        this.elements.visibilityMeters.valueAsNumber =
            this.elements.visibilitySm.valueAsNumber === 10
                ? 9999
                : Math.round((this.elements.visibilitySm.valueAsNumber * 1609.344) / 100) * 100;
    };
    setSmFromMeters = () => {
        this.elements.visibilitySm.valueAsNumber =
            this.elements.visibilityMeters.valueAsNumber === 9999
                ? 10
                : Math.round(this.elements.visibilityMeters.valueAsNumber / 1609.344 / 0.25) * 0.25;
    };
    static registerElement() {
        registerElement("startgeraet-visibility", VisibilityWebComponent);
    }
}
