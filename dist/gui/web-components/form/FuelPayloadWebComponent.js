import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export class FuelPayloadWebComponent extends AbstractStateSubscriberWebComponent {
    isInitialized = false;
    elements;
    weightProPerson_kg = 82;
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
        <label for="fuelloadsetting-persons">Persons <span></span></label>
        <input id="fuelloadsetting-persons" type="number" value="0" min="0" />
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
            persons: this.querySelector("#fuelloadsetting-persons"),
            personsMax: document.querySelector("label[for='fuelloadsetting-persons'] span"),
        };
    }
    get state() {
        return {
            fuelMass: this.elements.fuelMass.valueAsNumber,
            payloadMass: this.elements.payloadMass.valueAsNumber +
                this.elements.persons.valueAsNumber * this.weightProPerson_kg,
        };
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        this.subscribeToStateUpdates((state) => {
            this.elements.fuelMass.valueAsNumber = Math.floor(state.aeroflyFlight.fuelLoadSetting.fuelMass);
            this.elements.fuelMass.max = state.aircraftData?.maximumFuelMassKg?.toFixed() ?? "0";
            this.elements.fuelMass.disabled = this.elements.fuelMass.max === "0";
            this.elements.fuelMassMax.textContent = state.aircraftData?.maximumFuelMassKg
                ? `(max. ${this.numberFormat(state.aircraftData.maximumFuelMassKg)} kg)`
                : "";
            const maxPersons = Math.min(state.aircraftData?.maximumPersonsOnBoard ?? Infinity, Math.floor(state.getMaxRemainingPayload_kg / this.weightProPerson_kg));
            const personsMass = Math.floor(this.elements.persons.valueAsNumber * this.weightProPerson_kg);
            const maxPayload = Math.floor(state.getMaxRemainingPayload_kg - personsMass);
            const payloadMass = Math.max(0, Math.floor(state.aeroflyFlight.fuelLoadSetting.payloadMass - personsMass));
            this.elements.payloadMass.valueAsNumber = payloadMass;
            this.elements.payloadMass.max = maxPayload.toFixed();
            this.elements.payloadMass.disabled = this.elements.payloadMass.max === "0";
            this.elements.payloadMassMax.textContent = state.getMaxRemainingPayload_kg
                ? `(max. ${this.numberFormat(maxPayload)} kg)`
                : "";
            this.elements.persons.max = maxPersons.toFixed();
            this.elements.persons.disabled = this.elements.persons.max === "0";
            this.elements.personsMax.textContent = state.getMaxRemainingPayload_kg
                ? `(max. ${this.numberFormat(maxPersons)} ${maxPersons === 1 ? "person" : "persons"})`
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
    numberFormat(value) {
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }
    static registerElement() {
        customElements.define("startgeraet-fuel-payload", FuelPayloadWebComponent);
    }
}
