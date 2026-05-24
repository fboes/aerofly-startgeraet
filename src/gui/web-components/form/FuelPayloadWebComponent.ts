import { sendToMain } from "../../renderer/sendToMain.js";

export type FuelPayloadWebComponentState = {
    fuelMass: number;
    payloadMass: number;
};

export class FuelPayloadWebComponent extends HTMLElement {
    elements: {
        fuelMass: HTMLInputElement;
        fuelMassMax: HTMLSpanElement;
        payloadMass: HTMLInputElement;
        payloadMassMax: HTMLSpanElement;
    };

    constructor() {
        super();
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
            fuelMass: document.getElementById("fuelloadsetting-fuelmass") as HTMLInputElement,
            fuelMassMax: document.querySelector("label[for='fuelloadsetting-fuelmass'] span") as HTMLSpanElement,
            payloadMass: document.getElementById("fuelloadsetting-payloadmass") as HTMLInputElement,
            payloadMassMax: document.querySelector("label[for='fuelloadsetting-payloadmass'] span") as HTMLSpanElement,
        };
    }

    get state(): FuelPayloadWebComponentState {
        return {
            fuelMass: this.elements.fuelMass.valueAsNumber,
            payloadMass: this.elements.payloadMass.valueAsNumber,
        };
    }

    connectedCallback() {
        window.electronAPI.onStateUpdate((state) => {
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

    handleChange() {
        sendToMain<FuelPayloadWebComponentState>("fuel-payload:set", this.state);
    }

    static registerElement() {
        customElements.define("startgeraet-fuel-payload", FuelPayloadWebComponent);
    }
}
