import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";
import { sendToMain } from "../../renderer/sendToMain.js";
import type { AeroflyAirportCoordinatesObject } from "@fboes/aerofly-data/data/airport-coordinates-object.json";
import { dispatchNotificationEvent, type NotificationEventPayload } from "../../renderer/notificationEventHandler.js";
import type { IconWebComponent } from "../util/IconWebComponent.js";
import type { AppState } from "../../renderer/AppState.js";
import { numberFormat } from "../util/numberFormat.js";

export type FlightplanWebComponentState = {
    origin: string;
    destination: string;
};

type FlightplanWebComponentAirport = AeroflyAirportCoordinatesObject & { nameUppercase: string };

export class FlightplanWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized = false;

    private elements!: {
        flightplanOrigin: HTMLInputElement;
        flightplanOriginList: HTMLDataListElement;
        flightplanDestination: HTMLInputElement;
        flightplanDestinationList: HTMLDataListElement;
        flightplanDistance: HTMLAnchorElement;
        flightplanTime: HTMLOutputElement;
        fuelWarning: IconWebComponent;
    };

    private airportList: FlightplanWebComponentAirport[] = [];

    get state(): FlightplanWebComponentState {
        return {
            origin: this.elements.flightplanOrigin.value.trim().toUpperCase(),
            destination: this.elements.flightplanDestination.value.trim().toUpperCase(),
        };
    }

    private initialize() {
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3><startgeraet-icon icon="clipboard-check"></startgeraet-icon>&nbsp;Flight plan</h3>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Waypoint</th>
      <th>Distance</th>
      <th>Flight time</th>
    </tr>
  </thead>
  <tbody>
    <tr class="form-group">
      <th scope="row">From</th>
      <td>
        <input id="flightplan-origin" class="icao" list="flightplan-origin-list" pattern="[A-Za-z0-9]+" autocapitalize="characters" />
        <datalist id="flightplan-origin-list"></datalist>
      </td>
      <td rowspan="2">
        <a href="#" target="skyvector" id="flightplan-distance" title="See SkyVector flight plan">0NM</a>&nbsp;<startgeraet-icon icon="fuel-pump" title="Not enough range for non-stop flight" id="fuel-warning"></startgeraet-icon>
      </td>
      <td rowspan="2">
        <output id="flightplan-time">Unknown</output>
      </td>
    </tr>
    <tr class="form-group">
      <th scope="row">To</th>
      <td>
        <input id="flightplan-destination" class="icao" list="flightplan-destination-list" pattern="[A-Za-z0-9]+" autocapitalize="characters" />
        <datalist id="flightplan-destination-list"></datalist>
     </td>
    </tr>
  </tbody>
</table>
`;
        this.elements = {
            flightplanOrigin: this.querySelector("#flightplan-origin") as HTMLInputElement,
            flightplanOriginList: this.querySelector("#flightplan-origin-list") as HTMLDataListElement,
            flightplanDestination: this.querySelector("#flightplan-destination") as HTMLInputElement,
            flightplanDestinationList: this.querySelector("#flightplan-destination-list") as HTMLDataListElement,
            flightplanDistance: this.querySelector("#flightplan-distance") as HTMLAnchorElement,
            flightplanTime: this.querySelector("#flightplan-time") as HTMLOutputElement,
            fuelWarning: this.querySelector("#fuel-warning") as IconWebComponent,
        };
    }

    async connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        this.subscribeToStateUpdates((state) => {
            this.elements.flightplanOrigin.value = state.route.departureAirportCode;
            this.elements.flightplanOrigin.classList.remove("input-warning");
            this.elements.flightplanDestination.value = state.route.destinationAirportCode;
            this.elements.flightplanDestination.classList.remove("input-warning");

            this.elements.flightplanDistance.textContent = `${numberFormat(state.route.distance_nm)} NM`;
            this.elements.flightplanDistance.href = state.route.routeUrl;
            this.elements.flightplanDistance.title = `See SkyVector flight plan for route ${state.route.departureAirportCode} to ${state.route.destinationAirportCode}`;

            this.checkRangeWarning(state);

            this.elements.flightplanTime.textContent =
                state.route.flightTime.hours > 0
                    ? `${state.route.flightTime.hours} h ${state.route.flightTime.minutes.toString().padStart(2, "0")} min`
                    : `${state.route.flightTime.minutes.toString()} min`;
        });

        const airportList = await sendToMain<AeroflyAirportCoordinatesObject[]>("airports:get-list");
        this.airportList = airportList.map((a) => ({
            ...a,
            nameUppercase: a.name.toUpperCase(), // Add uppercase name for case-insensitive search
        }));

        this.elements.flightplanOrigin.addEventListener("input", this.handleChange);
        this.elements.flightplanDestination.addEventListener("input", this.handleChange);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.elements.flightplanOrigin.removeEventListener("input", this.handleChange);
        this.elements.flightplanDestination.removeEventListener("input", this.handleChange);
    }

    /**
     * Check ICAO input, send changes to flightplan if airports are found in DB
     */
    private handleChange = async (e: Event) => {
        const isOrigin = e.target === this.elements.flightplanOrigin;
        const { input, dataList } = this.getElements(isOrigin);
        const filtered = this.handleDataList(input, dataList);

        const hasExactMatch =
            filtered.length === 1 && input.value.length >= 4 && filtered[0]?.code === input.value.trim().toUpperCase();
        input.classList.toggle("input-warning", !hasExactMatch);

        if (hasExactMatch) {
            const response = await sendToMain<NotificationEventPayload<undefined>>("flightplan:set", this.state);
            dispatchNotificationEvent(document.body, response.message, response.type);
        }
    };

    /**
     * Update datalist by checking the current input.
     *
     * @returns the list of matching airports
     */
    private handleDataList(input: HTMLInputElement, dataList: HTMLDataListElement): FlightplanWebComponentAirport[] {
        const inputValue = input.value.trim().toUpperCase();

        // Autocomplete: Populate datalist if input has 2+ chars
        if (inputValue.length >= 2) {
            // Filter airportList for codes starting with inputValue
            const filtered = this.airportList.filter(
                (entry) => entry.code.startsWith(inputValue) || entry.nameUppercase.startsWith(inputValue),
            );
            dataList.innerHTML = "";
            filtered.forEach((entry) => {
                const option = document.createElement("option");
                option.value = entry.code; // ICAO code
                option.textContent = `${entry.code} - ${entry.name}`;
                dataList.appendChild(option);
            });
            return filtered;
        }

        // Restore default options if input < 2 chars
        dataList.innerHTML = `\
    <option value="KATL">KATL - Atlanta Airport</option>
    <option value="KLAX">KLAX - Los Angeles International Airport</option>
    <option value="EGLL">EGLL - London Heathrow Airport</option>
    <option value="OMDB">OMDB - Dubai International Airport</option>
    <option value="RJTT">RJTT - Tokyo Haneda Airport</option>
`;
        return [];
    }

    private checkRangeWarning(state: AppState) {
        const hasEnoughRange = state.route.distance_nm <= (state.aircraftData?.maximumRangeNm ?? 0);

        const maxRangeTitle = `${numberFormat(state.aircraftData?.maximumRangeNm ?? 0)} NM)`;
        this.elements.fuelWarning.title = hasEnoughRange
            ? `Enough range for non-stop flight (${maxRangeTitle})`
            : `Not enough range for non-stop flight (${maxRangeTitle})`;
        this.elements.fuelWarning.icon = hasEnoughRange ? "" : "fuel-pump";
        this.elements.fuelWarning.classList.toggle("has-warning", !hasEnoughRange);
    }

    private getElements(isOrigin = false) {
        return {
            input: isOrigin ? this.elements.flightplanOrigin : this.elements.flightplanDestination,
            dataList: isOrigin ? this.elements.flightplanOriginList : this.elements.flightplanDestinationList,
        };
    }

    static registerElement() {
        registerElement("startgeraet-flightplan", FlightplanWebComponent);
    }
}
