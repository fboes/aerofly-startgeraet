import { sendToMain } from "../../renderer/sendToMain.js";

export type FuelPayloadWebComponentState = {
    fuelMass: number;
    payloadMass: number;
};

export class FuelPayloadWebComponent extends HTMLElement {
    elements: {
        fuelMass: HTMLInputElement;
        payloadMass: HTMLInputElement;
    };

    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>⛽ Fuel / payload</h3>
<div class="d-flex">
    <div>
        <label for="fuelloadsetting-fuelmass">Fuel</label>
        <span class="d-flex">
            <input id="fuelloadsetting-fuelmass" type="number" value="0" min="0" />
            <span>kg</span></span>
        </div>
        <div>
            <label for="fuelloadsetting-payloadmass">Payload</label>
            <span class="d-flex">
                <input id="fuelloadsetting-payloadmass" type="number" value="0" min="0" />
                <span>kg</span>
            </span>
        </div>
    </div>
</div>
        `;
        this.elements = {
            fuelMass: document.getElementById("fuelloadsetting-fuelmass") as HTMLInputElement,
            payloadMass: document.getElementById("fuelloadsetting-payloadmass") as HTMLInputElement,
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

            this.elements.payloadMass.valueAsNumber = state.aeroflyFlight.fuelLoadSetting.payloadMass;
            this.elements.payloadMass.max = state.aircraftData?.maximumPayloadKg?.toString() ?? "0";
            this.elements.payloadMass.disabled = this.elements.payloadMass.max === "0";
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
