import { sendToMain } from "../../renderer/ipc-bridge.js";
export class AircraftWebComponent extends HTMLElement {
    elements;
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
            aircraftName: document.getElementById("aircraft-name"),
            aircraftPaintscheme: document.getElementById("aircraft-paintscheme"),
        };
    }
    connectedCallback() {
        sendToMain("aircraft:update").then((aircraft) => {
            this.elements.aircraftName.innerHTML = aircraft
                .map((aircraft) => `<option value="${aircraft.aeroflyCode}">${aircraft.nameFull}</option>`)
                .join("");
        });
        window.electronAPI.onStateUpdate((state) => {
            this.setAircraft(state.aeroflyFlight.aircraft.name, state.aeroflyFlight.aircraft.paintscheme);
        });
        this.elements.aircraftName.addEventListener("input", () => {
            this.setAircraft(this.elements.aircraftName.value);
        });
    }
    setAircraft(aeroflyCode, paintscheme = "") {
        console.log(`Setting aircraft to ${aeroflyCode} with paintscheme ${paintscheme}`);
        this.elements.aircraftName.value = aeroflyCode;
        sendToMain("aircraft:liveries", aeroflyCode).then((liveries) => {
            this.elements.aircraftPaintscheme.innerHTML = liveries
                .map((livery) => `<option value="${livery.aeroflyCode === "default" ? "" : livery.aeroflyCode}">${livery.name}</option>`)
                .join("");
            this.elements.aircraftPaintscheme.value = paintscheme;
        });
    }
    static registerElement() {
        customElements.define("startgeraet-aircraft", AircraftWebComponent);
    }
}
