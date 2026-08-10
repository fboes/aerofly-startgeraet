import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../util/registerElement.js";

export class AircraftInfoWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized = false;

    private elements!: {
        aircraftName: HTMLSpanElement;
        aircraftIcaoCode: HTMLOutputElement;
        aircraftCruiseSpeed: HTMLOutputElement;
        aircraftCruiseAltitude: HTMLOutputElement;
    };

    private initialize() {
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
            aircraftName: this.querySelector("h3 span") as HTMLSpanElement,
            aircraftIcaoCode: this.querySelector("#aircraft-icao") as HTMLOutputElement,
            aircraftCruiseSpeed: this.querySelector("#aircraft-cruise-speed") as HTMLOutputElement,
            aircraftCruiseAltitude: this.querySelector("#aircraft-cruise-altitude") as HTMLOutputElement,
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

    private numberFormat(value: number | undefined): string {
        if (value === undefined) {
            return "---";
        }
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }
}
