import { BaseStateSubscriberWebComponent } from "../util/StateSubscriberWebComponent.base.js";
import { registerElement } from "../../renderer/registerElement.js";
import { sendToMain } from "../../renderer/sendToMain.js";
import type { AeroflyAirportCoordinatesObject } from "@fboes/aerofly-data/data/airport-coordinates-object.json";
import { dispatchNotificationEvent, type NotificationEventPayload } from "../../renderer/notificationEventHandler.js";
import type { AppState } from "../../renderer/AppState.js";
import { numberFormat } from "../util/numberFormat.js";
import { htmlOptions } from "../../../core/formatter/html.js";

export type FlightplanWebComponentState = {
    origin: string;
    destination: string;
};

type FlightplanWebComponentAirport = AeroflyAirportCoordinatesObject & { nameUppercase: string };

export class FlightplanWebComponent extends BaseStateSubscriberWebComponent {
    private isInitialized = false;

    private elements!: {
        flightplanOrigin: HTMLInputElement;
        flightplanOriginList: HTMLDataListElement;
        flightplanDestination: HTMLInputElement;
        flightplanDestinationList: HTMLDataListElement;
        flightplanDistance: HTMLOutputElement;
        flightplanTime: HTMLOutputElement;
        flightplanFuel: HTMLOutputElement;
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
<section class="d-flex">

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Waypoint</th>
    </tr>
  </thead>
  <tbody>
    <tr class="form-group">
      <th scope="row">From</th>
      <td>
        <input id="flightplan-origin" class="icao" list="flightplan-origin-list" pattern="[A-Za-z0-9]+" autocapitalize="characters" />
        <datalist id="flightplan-origin-list"></datalist>
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

<table>
  <thead>
    <tr>
      <th>Distance</th>
      <th>Min fuel</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <output id="flightplan-distance">0NM</output>
      </td>
      <td rowspan="2" class="form-group">
        <output id="flightplan-fuel">N/A</output>
      </td>
    </tr>
    <tr>
      <td>
        <output id="flightplan-time">Unknown</output>
      </td>
    </tr>
  </tbody>
</table>

</section>
`;
        this.elements = {
            flightplanOrigin: this.querySelector("#flightplan-origin") as HTMLInputElement,
            flightplanOriginList: this.querySelector("#flightplan-origin-list") as HTMLDataListElement,
            flightplanDestination: this.querySelector("#flightplan-destination") as HTMLInputElement,
            flightplanDestinationList: this.querySelector("#flightplan-destination-list") as HTMLDataListElement,
            flightplanDistance: this.querySelector("#flightplan-distance") as HTMLOutputElement,
            flightplanTime: this.querySelector("#flightplan-time") as HTMLOutputElement,
            flightplanFuel: this.querySelector("#flightplan-fuel") as HTMLOutputElement,
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

            this.elements.flightplanTime.textContent =
                state.route.flightTime.hours > 0
                    ? `${state.route.flightTime.hours} h ${state.route.flightTime.minutes.toString().padStart(2, "0")} min`
                    : `${state.route.flightTime.minutes.toString()} min`;

            const minFuelKg = this.getMinFuelKg(state);
            this.elements.flightplanFuel.textContent =
                minFuelKg !== null
                    ? minFuelKg > 9000
                        ? `${numberFormat(minFuelKg / 1000, 1)} t`
                        : `${numberFormat(minFuelKg)} kg`
                    : "N/A";

            this.checkRangeWarning(state, minFuelKg);
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

            const options = filtered.map((entry) => ({
                value: entry.code, // ICAO code
                label: `${entry.code} - ${entry.name}`,
            }));

            dataList.innerHTML = htmlOptions(options);
            return filtered;
        }

        // Restore default options if input < 2 chars
        dataList.innerHTML = htmlOptions([
            { value: "KATL", label: "KATL - Atlanta Airport" },
            { value: "KLAX", label: "KLAX - Los Angeles International Airport" },
            { value: "EGLL", label: "EGLL - London Heathrow Airport" },
            { value: "OMDB", label: "OMDB - Dubai International Airport" },
            { value: "RJTT", label: "RJTT - Tokyo Haneda Airport" },
        ]);
        return [];
    }

    private getMinFuelKg(state: AppState): number | null {
        const aircraft = state.aircraftData;
        if (!aircraft?.maximumFuelMassKg) {
            return null;
        }

        const minFuelKg = (state.route.distance_nm / aircraft.maximumRangeNm) * aircraft.maximumFuelMassKg;
        if (minFuelKg <= 0) {
            return null;
        }
        return minFuelKg;
    }

    private checkRangeWarning(state: AppState, minFuelKg: number | null) {
        const hasEnoughRange = state.route.distance_nm <= (state.aircraftData?.maximumRangeNm ?? 0);

        const maxRangeTitle = `max ${numberFormat(state.aircraftData?.maximumRangeNm ?? 0)} NM`;
        this.elements.flightplanDistance.title = hasEnoughRange
            ? `Enough range for non-stop flight (${maxRangeTitle})`
            : `Not enough range for non-stop flight (${maxRangeTitle})`;
        this.elements.flightplanDistance.classList.toggle("input-warning", !hasEnoughRange);

        const hasEnoughFuel = minFuelKg === null || minFuelKg <= (state.aircraftData?.maximumFuelMassKg ?? 0);

        const maxFuelTitle = `max ${numberFormat(state.aircraftData?.maximumFuelMassKg ?? 0)} kg`;

        this.elements.flightplanFuel.title =
            minFuelKg === null
                ? `Fuel data not available for this aircraft`
                : hasEnoughFuel
                  ? `Enough fuel capacity for non-stop flight (${maxFuelTitle})`
                  : `Not enough fuel capacity for non-stop flight (${maxFuelTitle})`;
        this.elements.flightplanFuel.classList.toggle("input-warning", !hasEnoughFuel);
        this.elements.flightplanFuel.classList.toggle("inactive", minFuelKg === null);
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
