import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../util/registerElement.js";

export class FlightplanWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized = false;

    private elements!: {
        flightplanOrigin: HTMLAnchorElement;
        flightplanDestination: HTMLAnchorElement;
        flightplanDistance: HTMLAnchorElement;
        flightplanTime: HTMLOutputElement;
    };

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
      <td><a href="#" target="skyvector" id="flightplan-origin" title="See SkyVector airport data">Unknown</a></td>
      <td rowspan="2"><a href="#" target="skyvector" id="flightplan-distance" title="See SkyVector flight plan">0NM</a></td>
      <td rowspan="2"><output id="flightplan-time">Unknown</output></td>
    </tr>
    <tr class="form-group">
      <th scope="row">To</th>
      <td><a href="#" target="skyvector" id="flightplan-destination" title="See SkyVector airport data">Unknown</a></td>
    </tr>
  </tbody>
</table>
`;
        this.elements = {
            flightplanOrigin: this.querySelector("#flightplan-origin") as HTMLAnchorElement,
            flightplanDestination: this.querySelector("#flightplan-destination") as HTMLAnchorElement,
            flightplanDistance: this.querySelector("#flightplan-distance") as HTMLAnchorElement,
            flightplanTime: this.querySelector("#flightplan-time") as HTMLOutputElement,
        };
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        this.subscribeToStateUpdates((state) => {
            this.elements.flightplanOrigin.textContent = state.route.departureAirportCode;
            this.elements.flightplanOrigin.title = `See SkyVector airport data for ${state.route.departureAirport}`;
            this.elements.flightplanOrigin.href = state.route.departureAirportUrl;

            this.elements.flightplanDestination.textContent = state.route.destinationAirportCode;
            this.elements.flightplanDestination.title = `See SkyVector airport data for ${state.route.destinationAirport}`;
            this.elements.flightplanDestination.href = state.route.destinationAirportUrl;

            this.elements.flightplanDistance.textContent = `${state.route.distance_nm.toFixed(0)} NM`;
            this.elements.flightplanDistance.href = state.route.routeUrl;
            this.elements.flightplanDistance.title = `See SkyVector flight plan for route ${state.route.departureAirportCode} to ${state.route.destinationAirportCode}`;

            this.elements.flightplanTime.textContent =
                state.route.flightTime.hours > 0
                    ? `${state.route.flightTime.hours} h ${state.route.flightTime.minutes.toString().padStart(2, "0")} min`
                    : `${state.route.flightTime.minutes.toString()} min`;
        });
    }

    static registerElement() {
        registerElement("startgeraet-flightplan", FlightplanWebComponent);
    }
}
