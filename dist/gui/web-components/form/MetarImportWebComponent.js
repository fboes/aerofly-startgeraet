import { dispatchNotificationEvent } from "../../renderer/notificationEventHandler.js";
import { sendToMain } from "../../renderer/sendToMain.js";
export class MetarImportWebComponent extends HTMLElement {
    elements;
    constructor() {
        super();
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button commandfor="dialog-metar" command="show-modal" title="Fetch METAR weather information">Fetch METAR</button>

<dialog id="dialog-metar">
  <h3>Fetch METAR</h3>
  <div class="d-flex">
    <section class="d-flex">
        <div class="form-group">
            <label for="metar-origin">Fetch Metar for origin</label>
            <button id="metar-origin" title="Fetch METAR for current flight plan origin">Fetch METAR for current flight plan origin</button>
        </div>
        <div class="form-group">
            <label for="metar-destination">Fetch Metar for destination</label>
            <button id="metar-destination" title="Fetch METAR for current flight plan destination">Fetch METAR for current flight plan destination</button>
        </div>
    </section>
  </div>

  <button commandfor="dialog-metar" command="close" title="Close">✕</button>
</dialog>
        `;
        this.elements = {
            metarOrigin: this.querySelector("#metar-origin"),
            metarDestination: this.querySelector("#metar-destination"),
            dialog: this.querySelector("dialog"),
        };
    }
    connectedCallback() {
        window.electronAPI.onStateUpdate((state) => {
            this.elements.metarOrigin.innerHTML = state.route.departureAirport || "Origin";
            this.elements.metarOrigin.dataset.icao = state.route.departureAirportCode || "";
            this.elements.metarDestination.disabled = !state.route.destinationAirportCode;
            this.elements.metarDestination.innerHTML = state.route.destinationAirport || "Destination";
            this.elements.metarDestination.dataset.icao = state.route.destinationAirportCode || "";
            this.elements.metarOrigin.disabled = !state.route.destinationAirportCode;
        });
        this.elements.metarOrigin.addEventListener("click", () => {
            this.sendMetar(this.elements.metarOrigin.dataset.icao || "origin");
        });
        this.elements.metarDestination.addEventListener("click", () => {
            this.sendMetar(this.elements.metarDestination.dataset.icao || "destination");
        });
    }
    async sendMetar(icao) {
        this.elements.dialog.close();
        dispatchNotificationEvent(document.body, `Fetching METAR information for ${icao}`, "waiting");
        const response = await sendToMain("metar:fetch", {
            icao,
        });
        dispatchNotificationEvent(document.body, response.message, response.type);
    }
    static registerElement() {
        customElements.define("startgeraet-metar-import", MetarImportWebComponent);
    }
}
