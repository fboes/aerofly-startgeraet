export class TemperatureWebComponent extends HTMLElement {
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
    }
    connectedCallback() {
        const temperatureFahrenheit = document.getElementById("temperature-fahrenheit");
        const temperatureCelsius = document.getElementById("temperature-celsius");
        if (temperatureFahrenheit instanceof HTMLInputElement && temperatureCelsius instanceof HTMLInputElement) {
            temperatureFahrenheit.addEventListener("input", () => {
                temperatureCelsius.valueAsNumber = Math.round((temperatureFahrenheit.valueAsNumber - 32) * (5 / 9));
            });
            temperatureCelsius.addEventListener("input", () => {
                temperatureFahrenheit.valueAsNumber = Math.round(temperatureCelsius.valueAsNumber * 1.8 + 32);
            });
            temperatureFahrenheit.valueAsNumber = Math.round(temperatureCelsius.valueAsNumber * 1.8 + 32);
        }
    }
    static registerElement() {
        customElements.define("startgeraet-temperature", TemperatureWebComponent);
    }
}
