import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";

export type TemperatureWebComponentState = {
    temperatureCelsius: number;
};

export class TemperatureWebComponent extends AbstractStateSubscriberWebComponent {
    elements: {
        temperatureCelsius: HTMLInputElement;
        temperatureFahrenheit: HTMLInputElement;
    };

    constructor() {
        super();
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
            temperatureCelsius: this.querySelector("#temperature-celsius") as HTMLInputElement,
            temperatureFahrenheit: this.querySelector("#temperature-fahrenheit") as HTMLInputElement,
        };
    }

    get state(): TemperatureWebComponentState {
        return {
            temperatureCelsius: this.elements.temperatureCelsius.valueAsNumber,
        };
    }

    connectedCallback() {
        this.elements.temperatureFahrenheit.addEventListener("input", () => {
            this.setCelsiusFromFahrenheit();
        });
        this.elements.temperatureCelsius.addEventListener("input", () => {
            this.setFahrenheitFromCelsius();
        });
        this.setFahrenheitFromCelsius();

        this.subscribeToStateUpdates((state) => {
            this.elements.temperatureCelsius.valueAsNumber = Math.round(state.aeroflyFlight.wind.temperature_celsius);
            this.setFahrenheitFromCelsius();
        });

        this.addEventListener("input", () => this.handleChange());
    }

    handleChange() {
        sendToMain<TemperatureWebComponentState>("temperature:set", this.state);
    }

    protected setCelsiusFromFahrenheit() {
        this.elements.temperatureCelsius.valueAsNumber = Math.round(
            (this.elements.temperatureFahrenheit.valueAsNumber - 32) * (5 / 9),
        );
    }

    protected setFahrenheitFromCelsius() {
        this.elements.temperatureFahrenheit.valueAsNumber = Math.round(
            this.elements.temperatureCelsius.valueAsNumber * 1.8 + 32,
        );
    }

    static registerElement() {
        customElements.define("startgeraet-temperature", TemperatureWebComponent);
    }
}
