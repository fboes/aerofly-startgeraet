export class MetarImportWebComponent extends HTMLElement {
    elements;
    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>⛅ METAR import</h3>
<div class="d-flex">
    <button id="import-weather-from">Import weather for <span>KEYW</span></button>
    <button id="import-weather-to">Import weather for <span>KMIA</span></button>
</div>
        `;
        this.elements = {
            importWeatherFrom: document.getElementById("import-weather-from"),
            importWeatherFromSpan: document.querySelector("#import-weather-from span"),
            importWeatherTo: document.getElementById("import-weather-to"),
            importWeatherToSpan: document.querySelector("#import-weather-to span"),
        };
    }
    connectedCallback() {
        window.electronAPI.onStateUpdate((state) => {
            this.elements.importWeatherFromSpan.textContent =
                state.aeroflyFlight.navigation.waypoints.at(0)?.identifier ?? "Unknown";
            this.elements.importWeatherToSpan.textContent =
                state.aeroflyFlight.navigation.waypoints.at(-1)?.identifier ?? "Unknown";
        });
    }
    static registerElement() {
        customElements.define("startgeraet-metar-import", MetarImportWebComponent);
    }
}
