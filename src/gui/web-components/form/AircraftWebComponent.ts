import { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";

export class AircraftWebComponent extends HTMLElement {
    elements: {
        aircraftName: HTMLSelectElement;
        aircraftPaintscheme: HTMLSelectElement;
    };

    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>✈️ Aircraft</h3>

<div class="d-flex">
    <div>
        <label for="aircraft-name">Aircraft</label>
        <select id="aircraft-name">
            <option>Cessna 172</option>
        </select>
    </div>
    <div>
        <label for="aircraft-paintscheme">Livery</label>
        <select id="aircraft-paintscheme">
            <option>default</option>
        </select>
    </div>
</div>
        `;
        this.elements = {
            aircraftName: document.getElementById("aircraft-name") as HTMLSelectElement,
            aircraftPaintscheme: document.getElementById("aircraft-paintscheme") as HTMLSelectElement,
        };
    }

    connectedCallback() {
        window.aeroflyAircraftService.onSendAllAircraftLiveries((aircraftLiveries: AeroflyAircraft[]) => {
            this.elements.aircraftName.innerHTML = aircraftLiveries
                .map(
                    (aircraft) =>
                        `<option value="${aircraft.aeroflyCode !== "default" ? aircraft.aeroflyCode : ""}">${aircraft.nameFull}</option>`,
                )
                .join("");
        });

        window.aeroflyFlightService.onSendFlightplan((flightplan) => {
            this.setAircraft(flightplan.aeroflyFlight.aircraft.name, flightplan.aeroflyFlight.aircraft.paintscheme);
        });

        this.elements.aircraftName.addEventListener("input", () => {
            this.setAircraft(this.elements.aircraftName.value);
        });
    }

    protected setAircraft(aeroflyCode: string, paintscheme: string = "") {
        console.log(`Setting aircraft to ${aeroflyCode} with paintscheme ${paintscheme}`);
        this.elements.aircraftName.value = aeroflyCode;
        window.aeroflyAircraftService.getLiveries(aeroflyCode).then((liveries) => {
            this.elements.aircraftPaintscheme.innerHTML = liveries
                .map((livery) => `<option value="${livery.aeroflyCode}">${livery.name}</option>`)
                .join("");
            this.elements.aircraftPaintscheme.value = paintscheme;
        });
    }

    static registerElement() {
        customElements.define("startgeraet-aircraft", AircraftWebComponent);
    }
}
