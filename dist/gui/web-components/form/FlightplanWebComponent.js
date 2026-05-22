export class FlightplanWebComponent extends HTMLElement {
    elements;
    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>🛫 Flight plan</h3>
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
      <td><a href="#" target="skyvector" id="flightplan-origin">Unknown</a></td>
      <td rowspan="2"><a href="#" target="skyvector" id="flightplan-distance">0NM</a></td>
      <td rowspan="2"><output id="flightplan-time">0:00h</output></td>
    </tr>
    <tr class="form-group">
      <th scope="row">To</th>
      <td><a href="#" target="skyvector" id="flightplan-destination">Unknown</a></td>
    </tr>
  </tbody>
</table>
`;
        this.elements = {
            flightplanOrigin: document.getElementById("flightplan-origin"),
            flightplanDestination: document.getElementById("flightplan-destination"),
            flightplanDistance: document.getElementById("flightplan-distance"),
            flightplanTime: document.getElementById("flightplan-time"),
        };
    }
    connectedCallback() {
        window.electronAPI.onStateUpdate((state) => {
            this.elements.flightplanOrigin.textContent = state.route.departureAirportCode;
            this.elements.flightplanOrigin.title = state.route.departureAirport;
            this.elements.flightplanOrigin.href = state.route.departureAirportUrl;
            this.elements.flightplanDestination.textContent = state.route.destinationAirportCode;
            this.elements.flightplanDestination.title = state.route.destinationAirport;
            this.elements.flightplanDestination.href = state.route.destinationAirportUrl;
            this.elements.flightplanDistance.textContent = `${state.route.distance_nm.toFixed(0)}NM`;
            this.elements.flightplanDistance.href = state.route.routeUrl;
            this.elements.flightplanTime.textContent = `${state.route.flightTime.hours}:${state.route.flightTime.minutes.toString().padStart(2, "0")}h`;
        });
    }
    static registerElement() {
        customElements.define("startgeraet-flightplan", FlightplanWebComponent);
    }
}
