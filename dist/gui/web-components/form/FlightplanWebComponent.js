import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";
import { sendToMain } from "../../renderer/sendToMain.js";
import { dispatchNotificationEvent } from "../../renderer/notificationEventHandler.js";
export class FlightplanWebComponent extends AbstractStateSubscriberWebComponent {
    isInitialized = false;
    elements;
    airportList = [];
    get state() {
        return {
            origin: this.elements.flightplanOrigin.value.trim().toUpperCase(),
            destination: this.elements.flightplanDestination.value.trim().toUpperCase(),
        };
    }
    initialize() {
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
      <td rowspan="2"><a href="#" target="skyvector" id="flightplan-distance" title="See SkyVector flight plan">0NM</a></td>
      <td rowspan="2"><output id="flightplan-time">Unknown</output></td>
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
            flightplanOrigin: this.querySelector("#flightplan-origin"),
            flightplanOriginList: this.querySelector("#flightplan-origin-list"),
            flightplanDestination: this.querySelector("#flightplan-destination"),
            flightplanDestinationList: this.querySelector("#flightplan-destination-list"),
            flightplanDistance: this.querySelector("#flightplan-distance"),
            flightplanTime: this.querySelector("#flightplan-time"),
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
            this.elements.flightplanDistance.textContent = `${state.route.distance_nm.toFixed(0)} NM`;
            this.elements.flightplanDistance.href = state.route.routeUrl;
            this.elements.flightplanDistance.title = `See SkyVector flight plan for route ${state.route.departureAirportCode} to ${state.route.destinationAirportCode}`;
            this.elements.flightplanTime.textContent =
                state.route.flightTime.hours > 0
                    ? `${state.route.flightTime.hours} h ${state.route.flightTime.minutes.toString().padStart(2, "0")} min`
                    : `${state.route.flightTime.minutes.toString()} min`;
        });
        const airportList = await sendToMain("airports:get-list");
        this.airportList = airportList.map((a) => ({
            ...a,
            nameUppercase: a.name.toUpperCase(), // Add uppercase name for case-insensitive search
        }));
        this.elements.flightplanOrigin.addEventListener("input", this.handleChange);
        this.elements.flightplanDestination.addEventListener("input", this.handleChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.elements.flightplanOrigin.removeEventListener("input", this.handleChange);
        this.elements.flightplanDestination.removeEventListener("input", this.handleChange);
    }
    /**
     * Check ICAO input, send changes to flightplan if airports are found in DB
     */
    handleChange = async (e) => {
        const isOrigin = e.target === this.elements.flightplanOrigin;
        const { input, dataList } = this.getElements(isOrigin);
        const filtered = this.handleDataList(input, dataList);
        const hasExactMatch = filtered.length === 1 && input.value.length >= 4 && filtered[0]?.code === input.value.trim().toUpperCase();
        input.classList.toggle("input-warning", !hasExactMatch);
        if (hasExactMatch) {
            const response = await sendToMain("flightplan:set", this.state);
            dispatchNotificationEvent(document.body, response.message, response.type);
        }
    };
    /**
     * Update datalist by checking the current input.
     *
     * @returns the list of matching airports
     */
    handleDataList(input, dataList) {
        const inputValue = input.value.trim().toUpperCase();
        // Autocomplete: Populate datalist if input has 2+ chars
        if (inputValue.length >= 2) {
            // Filter airportList for codes starting with inputValue
            const filtered = this.airportList.filter((entry) => entry.code.startsWith(inputValue) || entry.nameUppercase.startsWith(inputValue));
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
    getElements(isOrigin = false) {
        return {
            input: isOrigin ? this.elements.flightplanOrigin : this.elements.flightplanDestination,
            dataList: isOrigin ? this.elements.flightplanOriginList : this.elements.flightplanDestinationList,
        };
    }
    static registerElement() {
        registerElement("startgeraet-flightplan", FlightplanWebComponent);
    }
}
