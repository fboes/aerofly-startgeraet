export class TemperatureWebComponent extends HTMLElement {
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
    <div>
        <label for="temperature-celsius">Temperature °C</label>
        <span class="d-flex">
            <input id="temperature-celsius" type="number" value="14" />
            <span>°C</span>
        </span>
    </div>
    <div>
        <label for="temperature-fahrenheit">Temperature °F</label>
        <span class="d-flex">
            <input id="temperature-fahrenheit" type="number" value="57" />
            <span>°F</span>
        </span>
    </div>
</div>
        `;

        this.elements = {
            temperatureCelsius: document.getElementById("temperature-celsius") as HTMLInputElement,
            temperatureFahrenheit: document.getElementById("temperature-fahrenheit") as HTMLInputElement,
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

        window.aeroflyFlightService.onSendFlightplan((flightplan) => {
            this.elements.temperatureCelsius.valueAsNumber = flightplan.aeroflyFlight.wind.temperature_celsius;
            this.setFahrenheitFromCelsius();
        });
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
