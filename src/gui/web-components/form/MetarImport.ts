export class MetarImport extends HTMLElement {
    elements: {
        importWeatherFrom: HTMLButtonElement;
        importWeatherFromSpan: HTMLSpanElement;
        importWeatherTo: HTMLButtonElement;
        importWeatherToSpan: HTMLSpanElement;
    };

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
            importWeatherFrom: document.getElementById("import-weather-from") as HTMLButtonElement,
            importWeatherFromSpan: document.querySelector("#import-weather-from span") as HTMLSpanElement,
            importWeatherTo: document.getElementById("import-weather-to") as HTMLButtonElement,
            importWeatherToSpan: document.querySelector("#import-weather-to span") as HTMLSpanElement,
        };
    }

    connectedCallback() {
        window.aeroflyFlightService.onSendFlightplan((flightplan) => {
            this.elements.importWeatherFromSpan.textContent =
                flightplan.aeroflyFlight.navigation.waypoints.at(0)?.identifier ?? "Unknown";
            this.elements.importWeatherToSpan.textContent =
                flightplan.aeroflyFlight.navigation.waypoints.at(-1)?.identifier ?? "Unknown";
        });
    }

    static registerElement() {
        customElements.define("startgeraet-metar-import", MetarImport);
    }
}
