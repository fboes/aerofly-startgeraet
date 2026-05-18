import { AircraftWebComponent } from "../form/AircraftWebComponent.js";
import { CloudsWebComponent } from "../form/CloudsWebComponent.js";
import { FlightplanWebComponent } from "../form/FlightplanWebComponent.js";
import { FuelPayloadWebComponent } from "../form/FuelPayloadWebComponent.js";
import { MetarImport } from "../form/MetarImport.js";
import { TemperatureWebComponent } from "../form/TemperatureWebComponent.js";
import { TimeAndDateWebComponent } from "../form/TimeAndDateWebComponent.js";
import { VisibilityWebComponent } from "../form/VisibilityWebComponent.js";
import { WindWebComponent } from "../form/WindWebComponent.js";

export class MainWebComponent extends HTMLElement {
    constructor() {
        super();

        AircraftWebComponent.registerElement();
        FuelPayloadWebComponent.registerElement();
        FlightplanWebComponent.registerElement();
        TimeAndDateWebComponent.registerElement();
        MetarImport.registerElement();
        WindWebComponent.registerElement();
        TemperatureWebComponent.registerElement();
        VisibilityWebComponent.registerElement();
        CloudsWebComponent.registerElement();

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
        <startgeraet-metar-import></startgeraet-metar-import>
        <startgeraet-wind class="flex-grow-2"></startgeraet-wind>
        <startgeraet-temperature></startgeraet-temperature>
        <startgeraet-visibility></startgeraet-visibility>
        <startgeraet-clouds class="flex-grow-2"></startgeraet-clouds>
    </div>
</details>
        `;
    }

    static registerElement() {
        customElements.define("startgeraet-main", MainWebComponent);
    }
}
