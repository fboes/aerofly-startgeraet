import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export class TemperatureWebComponent extends AbstractStateSubscriberWebComponent {
    isInitialized = false;
    elements;
    initialize() {
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>🌡️ Temperature</h3>
<div class="d-flex">
    <div class="form-group">
        <label for="temperature-celsius">Temperature °C</label>
        <span class="d-flex">
            <input id="temperature-celsius" type="number" value="14" />
            <span>°C</span>
        </span>
    </div>
    <div class="form-group">
        <label for="temperature-fahrenheit">Temperature °F</label>
        <span class="d-flex">
            <input id="temperature-fahrenheit" type="number" value="57" />
            <span>°F</span>
        </span>
    </div>
</div>
        `;
        this.elements = {
            temperatureCelsius: this.querySelector("#temperature-celsius"),
            temperatureFahrenheit: this.querySelector("#temperature-fahrenheit"),
        };
    }
    get state() {
        return {
            temperatureCelsius: this.elements.temperatureCelsius.valueAsNumber,
        };
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        this.elements.temperatureFahrenheit.addEventListener("input", this.setCelsiusFromFahrenheit);
        this.elements.temperatureCelsius.addEventListener("input", this.setFahrenheitFromCelsius);
        this.setFahrenheitFromCelsius();
        this.subscribeToStateUpdates((state) => {
            this.elements.temperatureCelsius.valueAsNumber = Math.round(state.aeroflyFlight.wind.temperature_celsius);
            this.setFahrenheitFromCelsius();
        });
        this.addEventListener("input", this.handleChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.elements.temperatureFahrenheit.removeEventListener("input", this.setCelsiusFromFahrenheit);
        this.elements.temperatureCelsius.removeEventListener("input", this.setFahrenheitFromCelsius);
        this.setFahrenheitFromCelsius();
        this.removeEventListener("input", this.handleChange);
    }
    handleChange = () => {
        sendToMain("temperature:set", this.state);
    };
    setCelsiusFromFahrenheit = () => {
        this.elements.temperatureCelsius.valueAsNumber = Math.round((this.elements.temperatureFahrenheit.valueAsNumber - 32) * (5 / 9));
    };
    setFahrenheitFromCelsius = () => {
        this.elements.temperatureFahrenheit.valueAsNumber = Math.round(this.elements.temperatureCelsius.valueAsNumber * 1.8 + 32);
    };
    static registerElement() {
        customElements.define("startgeraet-temperature", TemperatureWebComponent);
    }
}
