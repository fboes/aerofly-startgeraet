import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export class FuelPayloadWebComponent extends AbstractStateSubscriberWebComponent {
    isInitialized = false;
    maximumTakeoffMassKg = 0;
    elements;
    weightProPerson_kg = 84;
    initialize() {
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>⛽ Fuel / payload</h3>
<div class="d-flex">
    <div class="form-group">
        <label for="fuelloadsetting-fuelmass">Fuel <span></span></label>
        <span class="input-group">
            <input id="fuelloadsetting-fuelmass" type="number" value="0" min="0" />
            <span>kg</span>
        </span>
    </div>
    <div class="form-group">
        <label for="fuelloadsetting-range">Range <span></span></label>
        <span class="input-group">
            <input id="fuelloadsetting-range" type="number" value="0" min="0" />
            <span>NM</span>
        </span>
    </div>
    <div class="form-group">
        <label for="fuelloadsetting-persons">Crew + <abbr title="Passengers">pax</abbr> <span></span></label>
        <input id="fuelloadsetting-persons" type="number" value="0" min="0" title="Recommend minimum persons: 1 pilot" />
    </div>
    <div class="form-group">
        <label for="fuelloadsetting-payloadmass">Payload <span></span></label>
        <span class="input-group">
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
            range: this.querySelector("#fuelloadsetting-range"),
            rangeMax: document.querySelector("label[for='fuelloadsetting-range'] span"),
        };
    }
    get state() {
        return {
            fuelMass: this.elements.fuelMass.valueAsNumber,
            payloadMass: (this.elements.payloadMass.valueAsNumber || 0) +
                (this.elements.persons.valueAsNumber || 0) * this.weightProPerson_kg,
        };
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        this.elements.range.addEventListener("input", this.handleRangeChange);
        this.subscribeToStateUpdates((state) => {
            const fuelMassMax = Math.floor(state.aircraftData?.maximumFuelMassKg ?? 0);
            const maxRange = Math.floor(state.aircraftData?.maximumRangeNm ?? 0);
            const maxPersons = Math.min(state.aircraftData?.maximumPersonsOnBoard ?? Infinity, Math.floor(state.getMaxRemainingPayload_kg / this.weightProPerson_kg));
            const personsMass = Math.floor(this.elements.persons.valueAsNumber * this.weightProPerson_kg);
            const maxPayload = Math.floor(state.getMaxRemainingPayload_kg - personsMass);
            const payloadMass = Math.max(0, Math.floor(state.aeroflyFlight.fuelLoadSetting.payloadMass - personsMass));
            this.maximumTakeoffMassKg = state.aircraftData?.maximumTakeoffMassKg ?? 1;
            const calculateRange = (fuelMass) => maxRange *
                (fuelMass / (fuelMassMax || 1)) *
                (1 - state.aeroflyFlight.fuelLoadSetting.payloadMass / this.maximumTakeoffMassKg);
            const currentRange = calculateRange(state.aeroflyFlight.fuelLoadSetting.fuelMass), lowerBound = calculateRange(state.aeroflyFlight.fuelLoadSetting.fuelMass - 1), upperBound = calculateRange(state.aeroflyFlight.fuelLoadSetting.fuelMass + 1);
            // ----------------------------------
            this.elements.fuelMass.valueAsNumber = Math.floor(state.aeroflyFlight.fuelLoadSetting.fuelMass);
            this.elements.fuelMass.max = fuelMassMax.toFixed();
            this.elements.fuelMass.disabled = this.elements.fuelMass.max === "0";
            this.elements.fuelMassMax.textContent = fuelMassMax ? `(max. ${this.numberFormat(fuelMassMax)} kg)` : "";
            // TODO: Only change range slider if slider value could not have been created from the given fuel mass
            if (lowerBound > this.elements.range.valueAsNumber || upperBound < this.elements.range.valueAsNumber) {
                this.elements.range.valueAsNumber = Math.floor(currentRange);
            }
            this.elements.range.classList.toggle("input-warning", this.elements.range.valueAsNumber < state.route.distance_nm);
            this.title = `Recommended minimal range: ${state.route.distance_nm.toFixed()} NM`;
            this.elements.range.max = maxRange.toFixed();
            this.elements.range.disabled = this.elements.range.max === "0" || this.elements.fuelMass.max === "0";
            this.elements.rangeMax.textContent = maxRange ? `(max. ${this.numberFormat(maxRange)} NM)` : "";
            this.elements.payloadMass.valueAsNumber = payloadMass;
            this.elements.payloadMass.max = maxPayload.toFixed();
            this.elements.payloadMass.disabled = this.elements.payloadMass.max === "0";
            this.elements.payloadMassMax.textContent = state.getMaxRemainingPayload_kg
                ? `(max. ${this.numberFormat(maxPayload)} kg)`
                : "";
            this.elements.persons.classList.toggle("input-warning", this.elements.persons.valueAsNumber < 1 &&
                this.elements.payloadMass.valueAsNumber < this.weightProPerson_kg);
            this.elements.persons.max = maxPersons.toFixed();
            this.elements.persons.disabled = this.elements.persons.max === "0";
            this.elements.personsMax.textContent = state.getMaxRemainingPayload_kg
                ? `(max. ${this.numberFormat(maxPersons)})`
                : "";
        });
        this.addEventListener("input", this.handleChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.elements.range.removeEventListener("input", this.handleRangeChange);
        this.removeEventListener("input", this.handleChange);
    }
    handleRangeChange = () => {
        const maxRange = parseFloat(this.elements.range.max);
        const range = this.elements.range.valueAsNumber;
        if (maxRange > 0) {
            const fuelMass = Math.ceil(((range / maxRange) * parseFloat(this.elements.fuelMass.max)) /
                (1 - this.elements.payloadMass.valueAsNumber / this.maximumTakeoffMassKg));
            this.elements.fuelMass.valueAsNumber = fuelMass;
        }
    };
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
