import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";
export class AircraftInfoWebComponent extends AbstractStateSubscriberWebComponent {
    isInitialized = false;
    elements;
    initialize() {
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3><startgeraet-icon icon="airplane"></startgeraet-icon>&nbsp;<span>Aircraft</span></h3>

<div class="d-flex">
    <div class="form-group">
        <label for="aircraft-icao">ICAO code</label>
        <output id="aircraft-icao"></output>
    </div>
    <div class="form-group">
        <label for="aircraft-cruise-speed">Cruise speed</label>
        <span class="input-group">
            <output id="aircraft-cruise-speed"></output>
            <span>kts</span>
        </span>
    </div>
     <div class="form-group">
        <label for="aircraft-cruise-altitude">Cruise altitude</label>
        <span class="input-group">
            <output id="aircraft-cruise-altitude"></output>
            <span>ft</span>
        </span>
    </div>
</div>
        `;
        this.elements = {
            aircraftName: this.querySelector("h3 span"),
            aircraftIcaoCode: this.querySelector("#aircraft-icao"),
            aircraftCruiseSpeed: this.querySelector("#aircraft-cruise-speed"),
            aircraftCruiseAltitude: this.querySelector("#aircraft-cruise-altitude"),
        };
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        this.subscribeToStateUpdates((state) => {
            this.elements.aircraftName.innerText = state.aircraftData?.nameFull ?? "Aircraft data";
            this.elements.aircraftIcaoCode.value = state.aircraftData?.icaoCode ?? "---";
            this.elements.aircraftCruiseSpeed.value = this.numberFormat(state.aircraftData?.cruiseSpeedKts);
            this.elements.aircraftCruiseAltitude.value = this.numberFormat(state.aircraftData?.cruiseAltitudeFt);
        });
    }
    static registerElement() {
        registerElement("startgeraet-aircraft-info", AircraftInfoWebComponent);
    }
    numberFormat(value) {
        if (value === undefined) {
            return "---";
        }
        return new Intl.NumberFormat(document.documentElement.lang, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }
}
