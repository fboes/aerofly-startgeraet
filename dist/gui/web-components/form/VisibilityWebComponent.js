import { sendToMain } from "../../renderer/sendToMain.js";
export class VisibilityWebComponent extends HTMLElement {
    elements;
    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>🌁 Visibility</h3>
<div class="d-flex">
    <div class="form-group">
        <label for="visibility-sm">Visibility SM</label>
        <span class="d-flex">
            <input id="visibility-sm" type="number" min="0" step="0.25" value="10" />
            <span>SM</span>
        </span>
    </div>
    <div class="form-group">
        <label for="visibility-meters">Visibility m</label>
        <span class="d-flex">
            <input id="visibility-meters" type="number" min="0" step="100" value="9999" />
            <span>m</span>
        </span>
    </div>
</div>
        `;
        this.elements = {
            visibilitySm: document.getElementById("visibility-sm"),
            visibilityMeters: document.getElementById("visibility-meters"),
        };
    }
    get state() {
        return {
            visibilityMeters: this.elements.visibilityMeters.valueAsNumber,
        };
    }
    connectedCallback() {
        this.elements.visibilitySm.addEventListener("input", () => {
            this.setMetersFromSm();
        });
        this.elements.visibilityMeters.addEventListener("input", () => {
            this.setSmFromMeters();
        });
        this.setSmFromMeters();
        window.electronAPI.onStateUpdate((state) => {
            this.elements.visibilityMeters.valueAsNumber = Math.round(state.aeroflyFlight.visibility_meter);
            this.setSmFromMeters();
        });
        this.addEventListener("input", () => this.handleChange());
    }
    handleChange() {
        sendToMain("visibility:set", this.state);
    }
    setMetersFromSm() {
        this.elements.visibilityMeters.valueAsNumber =
            Math.round((this.elements.visibilitySm.valueAsNumber * 1609.344) / 100) * 100;
    }
    setSmFromMeters() {
        this.elements.visibilitySm.valueAsNumber =
            this.elements.visibilityMeters.valueAsNumber === 9999
                ? 10
                : Math.round(this.elements.visibilityMeters.valueAsNumber / 1609.344 / 0.25) * 0.25;
    }
    static registerElement() {
        customElements.define("startgeraet-visibility", VisibilityWebComponent);
    }
}
