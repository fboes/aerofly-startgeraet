import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export class AircraftWebComponent extends AbstractStateSubscriberWebComponent {
    isInitialized = false;
    showIcaoCode = true;
    elements;
    get state() {
        return {
            aircraftName: this.elements.aircraftName.value,
            aircraftPaintscheme: this.elements.aircraftPaintscheme.value,
            cruiseSpeed_kts: this.elements.aircraftCruiseSpeed.valueAsNumber,
            cruiseAltitude_ft: this.elements.aircraftCruiseAltitude.valueAsNumber,
        };
    }
    initialize() {
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<div class="d-flex">
    <div class="form-group">
        <label for="aircraft-name" class="header">✈️ Aircraft</label>
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
    <div class="form-group">
        <label for="aircraft-cruise-speed">Cruise speed</label>
        <span class="input-group">
            <input id="aircraft-cruise-speed" type="number" min="0" step="1" />
            <span>kts</span>
        </span>
    </div>
     <div class="form-group">
        <label for="aircraft-cruise-altitude">Cruise altitude</label>
        <span class="input-group">
            <input id="aircraft-cruise-altitude" type="number" min="0" step="1" />
            <span>ft</span>
        </span>
    </div>
</div>
        `;
        this.elements = {
            aircraftName: this.querySelector("#aircraft-name"),
            aircraftPaintscheme: this.querySelector("#aircraft-paintscheme"),
            aircraftCruiseSpeed: this.querySelector("#aircraft-cruise-speed"),
            aircraftCruiseAltitude: this.querySelector("#aircraft-cruise-altitude"),
        };
        if (this.showIcaoCode) {
            this.elements.aircraftName.title = "ICAO codes in brackets";
            this.elements.aircraftPaintscheme.title = "ICAO codes in brackets";
        }
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        sendToMain("aircraft:update").then((aircraft) => {
            this.elements.aircraftName.innerHTML = aircraft
                .sort((a, b) => a.nameFull.localeCompare(b.nameFull))
                .map((aircraft) => {
                let optionLabel = aircraft.nameFull;
                if (this.showIcaoCode && aircraft.icaoCode) {
                    optionLabel += ` [${aircraft.icaoCode}]`;
                }
                return `<option value="${aircraft.aeroflyCode}">${optionLabel}</option>`;
            })
                .join("");
        });
        this.subscribeToStateUpdates((state) => {
            this.elements.aircraftName.value = state.aeroflyFlight.aircraft.name;
            this.elements.aircraftPaintscheme.innerHTML =
                state.aircraftData?.liveries
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((livery) => {
                    let optionLabel = livery.name;
                    if (this.showIcaoCode && livery.icaoCode) {
                        optionLabel += ` [${livery.icaoCode}]`;
                    }
                    return `<option value="${livery.aeroflyCode === "default" ? "" : livery.aeroflyCode}">${optionLabel}</option>`;
                })
                    .join("") ?? `<option value="">default</option>`;
            this.elements.aircraftPaintscheme.value = state.aeroflyFlight.aircraft.paintscheme || "";
            this.elements.aircraftCruiseSpeed.valueAsNumber = Math.round(state.route.cruiseSpeed_kts);
            this.elements.aircraftCruiseAltitude.valueAsNumber = Math.round(state.route.cruiseAltitude_ft);
        });
        this.addEventListener("change", this.handleChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener("change", this.handleChange);
    }
    handleChange = () => {
        sendToMain("aircraft:set", this.state);
    };
    static registerElement() {
        customElements.define("startgeraet-aircraft", AircraftWebComponent);
    }
}
