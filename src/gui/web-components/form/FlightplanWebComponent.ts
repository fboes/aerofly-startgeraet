export class FlightplanWebComponent extends HTMLElement {
    elements: {
        flightplanRoute: HTMLButtonElement;
        flightplanDistance: HTMLOutputElement;
        flightplanTime: HTMLOutputElement;
    };

    constructor() {
        super();
        this.setAttribute("aria-role", "region");
        this.innerHTML = `\
<h3>🛫 Flight plan</h3>
<div class="d-flex">
    <div>
        <label for="flightplan-route">Route</label>
        <button title="Import / export" id="flightplan-route" commandfor="dialog-flightplan" command="show-modal">
            KEYW → MTH → KMIA
        </button>
    </div>
    <div>
        <label for="flightplan-distance">Distance</label>
        <output id="flightplan-distance">120NM</output>
    </div>
    <div>
        <label for="flightplan-time">Flight time</label>
        <output id="flightplan-time">0:30h</output>
    </div>
</div>

  <dialog id="dialog-flightplan" closedby="any">
    <h3>Flight plan import</h3>

    <div class="d-flex">
      <section>
        <label for="import-file">Import flight plan from file</label>
        <input id="import-file" type="file" accept=".mcf,.tmc,.fpl,.pln,.fms" class="w-100" />
      </section>
      <section class="d-flex">
        <div>
          <label for="settings-simbriefusername">SimBrief username</label>
          <input id="settings-simbriefusername" type="text" pattern="[A-Za-z0-9]+" />
        </div>
        <button id="import-simbrief">Import flight plan from SimBrief</button>
      </section>
      <section class="d-flex inactive">
        <div>
          <label for="mission-generatortype">Mission generator: Type</label>
          <select disabled>
            <option>Landing pattern</option>
            <option>Holding pattern</option>
            <option>Helicopter Emergency Medical Services</option>
          </select>
        </div>
        <button disabled id="mission-generator">Mission generator</button>
      </section>
    </div>

    <h3>Flight plan export</h3>
    <div class="d-flex">
      <section class="d-flex">
        <div>
          <label for="export-filetype">Export file type</label>
          <select id="export-filetype">
            <option value="mcf">Aerofly MCF flight plan file</option>
            <option value="tmc">Aerofly TMC custom user missions file</option>
            <option value="geojson">GeoJSON file</option>
            <option value="kml">Keyhole Markup Language (KML) file</option>
          </select>
        </div>
        <button id="export-file">Export flight plan to file</button>
      </section>
    </div>

    <button commandfor="dialog-flightplan" command="close" title="Close">✕</button>
  </dialog>

  <dialog id="dialog-import-simbrief" closedby="any">
    <h3>Import flight plan from SimBrief</h3>
    <div class="d-flex flex-grow-3">
      <button id="import-file">Import flight plan from file</button>
      <button id="import-simbrief">Import flight plan from SimBrief</button>
      <button id="export-file">Export flight plan to file</button>
      <button disabled id="mission-generator">Mission generator</button>
    </div>
    <button commandfor="dialog-flightplan" command="close" title="Close">✕</button>
  </dialog>
        `;
        this.elements = {
            flightplanRoute: document.getElementById("flightplan-route") as HTMLButtonElement,
            flightplanDistance: document.getElementById("flightplan-distance") as HTMLOutputElement,
            flightplanTime: document.getElementById("flightplan-time") as HTMLOutputElement,
        };
    }

    connectedCallback() {
        window.aeroflyFlightService.onSendFlightplan((flightplan) => {
            this.elements.flightplanRoute.textContent = flightplan.route.routeString;
            this.elements.flightplanDistance.textContent = `${flightplan.route.distance_nm.toFixed(0)}NM`;
            this.elements.flightplanTime.textContent = `${flightplan.route.flightTime.hours}:${flightplan.route.flightTime.minutes.toString().padStart(2, "0")}h`;
        });
    }

    static registerElement() {
        customElements.define("startgeraet-flightplan", FlightplanWebComponent);
    }
}
