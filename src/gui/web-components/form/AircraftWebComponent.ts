import type { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import { sendToMain } from "../../renderer/sendToMain.js";

export type AircraftWebComponentState = {
    aircraftName: string;
    aircraftPaintscheme: string;
};

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
    <div class="form-group">
        <label for="aircraft-name">Aircraft</label>
        <select id="aircraft-name">
            <option>Cessna 172</option>
        </select>
    </div>
    <div class="form-group">
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

    get state(): AircraftWebComponentState {
        return {
            aircraftName: this.elements.aircraftName.value,
            aircraftPaintscheme: this.elements.aircraftPaintscheme.value,
        };
    }

    connectedCallback() {
        sendToMain<AeroflyAircraft[]>("aircraft:update").then((aircraft) => {
            this.elements.aircraftName.innerHTML = aircraft
                .sort((a, b) => a.nameFull.localeCompare(b.nameFull))
                .map((aircraft) => `<option value="${aircraft.aeroflyCode}">${aircraft.nameFull}</option>`)
                .join("");
        });

        window.electronAPI.onStateUpdate((state) => {
            this.elements.aircraftName.value = state.aeroflyFlight.aircraft.name;
            this.elements.aircraftPaintscheme.innerHTML =
                state.aircraftData?.liveries
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(
                        (livery) =>
                            `<option value="${livery.aeroflyCode === "default" ? "" : livery.aeroflyCode}">${livery.name}</option>`,
                    )
                    .join("") ?? `<option value="">default</option>`;
            this.elements.aircraftPaintscheme.value = state.aeroflyFlight.aircraft.paintscheme || "";
        });

        this.addEventListener("change", this.handleChange);
    }

    handleChange() {
        sendToMain<AircraftWebComponentState>("aircraft:set", this.state);
    }

    static registerElement() {
        customElements.define("startgeraet-aircraft", AircraftWebComponent);
    }
}
