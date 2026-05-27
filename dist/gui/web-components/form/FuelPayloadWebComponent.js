import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export class FuelPayloadWebComponent extends AbstractStateSubscriberWebComponent {
    isInitialized = false;
    elements;
    initialize() {
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>⛽ Fuel / payload</h3>
<div class="d-flex">
    <div class="form-group">
        <label for="fuelloadsetting-fuelmass">Fuel <span></span></label>
        <span class="d-flex">
            <input id="fuelloadsetting-fuelmass" type="number" value="0" min="0" />
            <span>kg</span>
        </span>
    </div>
    <div class="form-group">
        <label for="fuelloadsetting-payloadmass">Payload <span></span></label>
        <span class="d-flex">
            <input id="fuelloadsetting-payloadmass" type="number" value="0" min="0" />
            <span>kg</span>
        </span>
    </div>
</div>
        `;
        this.elements = {
            fuelMass: this.querySelector("#fuelloadsetting-fuelmass"),
            fuelMassMax: document.querySelector("label[for='fuelloadsetting-fuelmass'] span"),
            payloadMass: this.querySelector("#fuelloadsetting-payloadmass"),
            payloadMassMax: document.querySelector("label[for='fuelloadsetting-payloadmass'] span"),
        };
    }
    get state() {
        return {
            fuelMass: this.elements.fuelMass.valueAsNumber,
            payloadMass: this.elements.payloadMass.valueAsNumber,
        };
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        this.subscribeToStateUpdates((state) => {
            this.elements.fuelMass.valueAsNumber = state.aeroflyFlight.fuelLoadSetting.fuelMass;
            this.elements.fuelMass.max = state.aircraftData?.maximumFuelMassKg?.toString() ?? "0";
            this.elements.fuelMass.disabled = this.elements.fuelMass.max === "0";
            this.elements.fuelMassMax.textContent = state.aircraftData?.maximumFuelMassKg
                ? `(max. ${Math.floor(state.aircraftData.maximumFuelMassKg)} kg)`
                : "";
            this.elements.payloadMass.valueAsNumber = state.aeroflyFlight.fuelLoadSetting.payloadMass;
            this.elements.payloadMass.max = state.aircraftData?.maximumPayloadKg?.toString() ?? "0";
            this.elements.payloadMass.disabled = this.elements.payloadMass.max === "0";
            this.elements.payloadMassMax.textContent = state.aircraftData?.maximumPayloadKg
                ? `(max. ${Math.floor(state.aircraftData.maximumPayloadKg)} kg)`
                : "";
        });
        this.addEventListener("input", this.handleChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener("input", this.handleChange);
    }
    handleChange = () => {
        sendToMain("fuel-payload:set", this.state);
    };
    static registerElement() {
        customElements.define("startgeraet-fuel-payload", FuelPayloadWebComponent);
    }
}
