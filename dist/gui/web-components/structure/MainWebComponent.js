import { AircraftWebComponent } from "../form/AircraftWebComponent.js";
import { CloudsWebComponent } from "../form/CloudsWebComponent.js";
import { FlightplanWebComponent } from "../form/FlightplanWebComponent.js";
import { FuelPayloadWebComponent } from "../form/FuelPayloadWebComponent.js";
import { WeatherStatusWebComponent } from "../form/WeatherStatusWebComponent.js";
import { TemperatureWebComponent } from "../form/TemperatureWebComponent.js";
import { TimeAndDateWebComponent } from "../form/TimeAndDateWebComponent.js";
import { VisibilityWebComponent } from "../form/VisibilityWebComponent.js";
import { WindWebComponent } from "../form/WindWebComponent.js";
import { ImportExportWebComponent } from "../form/ImportExportWebComponent.js";
import { MetarInputWebComponent } from "../form/MetarInputWebComponent.js";
export class MainWebComponent extends HTMLElement {
    isInitialized = false;
    initialize() {
        AircraftWebComponent.registerElement();
        FuelPayloadWebComponent.registerElement();
        FlightplanWebComponent.registerElement();
        TimeAndDateWebComponent.registerElement();
        WeatherStatusWebComponent.registerElement();
        WindWebComponent.registerElement();
        TemperatureWebComponent.registerElement();
        VisibilityWebComponent.registerElement();
        CloudsWebComponent.registerElement();
        ImportExportWebComponent.registerElement();
        MetarInputWebComponent.registerElement();
        this.setAttribute("aria-role", "main");
        this.innerHTML = `\
<details open>
    <summary><h2>Aircraft</h2></summary>
    <div class="d-flex">
        <startgeraet-aircraft></startgeraet-aircraft>
        <startgeraet-fuel-payload></startgeraet-fuel-payload>
    </div>
</details>

<details open>
    <summary><h2>Flight plan</h2></summary>
    <div class="d-flex">
        <startgeraet-flightplan></startgeraet-flightplan>
        <startgeraet-time-and-date class="flex-grow-2"></startgeraet-time-and-date>
    </div>
</details>

<details open>
    <summary><h2>Weather</h2></summary>
    <div class="d-flex">
        <startgeraet-weather-status></startgeraet-weather-status>
        <startgeraet-wind class="flex-grow-2"></startgeraet-wind>
        <startgeraet-temperature></startgeraet-temperature>
        <startgeraet-visibility></startgeraet-visibility>
        <startgeraet-clouds class="flex-grow-2"></startgeraet-clouds>
        <startgeraet-metar-input class="flex-grow-2"></startgeraet-metar-input>
    </div>
</details>

<details open>
    <summary><h2>Import / export</h2></summary>
    <div class="d-flex">
        <startgeraet-import-export></startgeraet-import-export>
    </div>
</details>
        `;
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
    }
    static registerElement() {
        customElements.define("startgeraet-main", MainWebComponent);
    }
}
