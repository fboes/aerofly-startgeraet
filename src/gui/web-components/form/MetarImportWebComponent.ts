import { dispatchNotificationEvent, type NotificationEventPayload } from "../../renderer/notificationEventHandler.js";
import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";

export type MetarImportWebComponentState = {
    icao: string;
};

export class MetarImportWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized = false;

    private elements!: {
        metarOrigin: HTMLButtonElement;
        metarDestination: HTMLButtonElement;
        dialog: HTMLDialogElement;
    };

    private initialize() {
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button commandfor="dialog-metar" command="show-modal" title="Fetch METAR weather information">Fetch METAR</button>

<dialog id="dialog-metar">
  <h3>Fetch METAR</h3>

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

  <button commandfor="dialog-metar" command="close" title="Close">✕</button>
</dialog>
        `;
        this.elements = {
            metarOrigin: this.querySelector("#metar-origin") as HTMLButtonElement,
            metarDestination: this.querySelector("#metar-destination") as HTMLButtonElement,
            dialog: this.querySelector("dialog") as HTMLDialogElement,
        };
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        this.subscribeToStateUpdates((state) => {
            this.elements.metarOrigin.innerHTML = state.route.departureAirport || "Origin";
            this.elements.metarOrigin.dataset.icao = state.route.departureAirportCode || "";
            this.elements.metarDestination.disabled = !state.route.destinationAirportCode;

            this.elements.metarDestination.innerHTML = state.route.destinationAirport || "Destination";
            this.elements.metarDestination.dataset.icao = state.route.destinationAirportCode || "";
            this.elements.metarOrigin.disabled = !state.route.destinationAirportCode;
        });

        this.elements.metarOrigin.addEventListener("click", this.handleClickOrigin);
        this.elements.metarDestination.addEventListener("click", this.handleClickDestination);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.elements.metarOrigin.removeEventListener("click", this.handleClickOrigin);
        this.elements.metarDestination.removeEventListener("click", this.handleClickDestination);
    }

    private handleClickOrigin = () => {
        this.sendMetar(this.elements.metarOrigin.dataset.icao || "origin");
    };

    private handleClickDestination = () => {
        this.sendMetar(this.elements.metarDestination.dataset.icao || "destination");
    };

    private async sendMetar(icao: string) {
        this.elements.dialog.close();
        dispatchNotificationEvent(document.body, `Fetching METAR information for ${icao}`, "waiting");

        const response = await sendToMain<NotificationEventPayload>("metar:fetch", {
            icao,
        });
        dispatchNotificationEvent(document.body, response.message, response.type);
    }

    static registerElement() {
        customElements.define("startgeraet-metar-import", MetarImportWebComponent);
    }
}
