import { dispatchNotificationEvent } from "../../renderer/notificationEventHandler.js";
import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";
import { registerShortcut, shortcutString } from "../../renderer/registerShortcut.js";
export class MetarImportWebComponent extends AbstractStateSubscriberWebComponent {
    isInitialized = false;
    shortcut = undefined;
    shortcutKey = "m";
    static METAR_FETCH_LIMIT_DAYS = 28;
    elements;
    initialize() {
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button commandfor="dialog-metar" command="show-modal">Fetch <u>M</u>ETAR</button>

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

  <footer>
    Please note that the METAR API does only provide METAR information for the last ${MetarImportWebComponent.METAR_FETCH_LIMIT_DAYS} days. Also the METAR API does not provide data for all airports worldwide.
  </footer>
</dialog>
        `;
        this.elements = {
            metarButton: this.querySelector("button"),
            metarOrigin: this.querySelector("#metar-origin"),
            metarDestination: this.querySelector("#metar-destination"),
            dialog: this.querySelector("dialog"),
        };
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
            this.setTitle();
        }
        this.subscribeToStateUpdates((state) => {
            this.elements.metarButton.disabled = this.isButtonDisabled(state);
            this.elements.metarOrigin.innerHTML = state.route.departureAirport || "Origin";
            this.elements.metarOrigin.dataset.icao = state.route.departureAirportCode || "";
            this.elements.metarDestination.disabled = !state.route.destinationAirportCode;
            const formGroup = this.elements.metarDestination.closest(".form-group");
            if (formGroup instanceof HTMLElement) {
                formGroup.style.display =
                    state.route.destinationAirportCode == state.route.departureAirportCode ? "none" : "block";
            }
            this.elements.metarDestination.innerHTML = state.route.destinationAirport || "Destination";
            this.elements.metarDestination.dataset.icao = state.route.destinationAirportCode || "";
            this.elements.metarOrigin.disabled = !state.route.destinationAirportCode;
            this.setTitle();
        });
        this.elements.metarOrigin.addEventListener("click", this.handleClickOrigin);
        this.elements.metarDestination.addEventListener("click", this.handleClickDestination);
        this.shortcut = registerShortcut(this.shortcutKey, () => {
            this.elements.dialog.showModal();
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.elements.metarOrigin.removeEventListener("click", this.handleClickOrigin);
        this.elements.metarDestination.removeEventListener("click", this.handleClickDestination);
        if (this.shortcut) {
            this.shortcut();
        }
    }
    setTitle() {
        this.elements.metarButton.title = this.elements.metarButton.disabled
            ? `Cannot fetch METAR weather information because the date is outside the allowed range of ${MetarImportWebComponent.METAR_FETCH_LIMIT_DAYS} days`
            : `Fetch METAR weather information, ${shortcutString("m")}`;
    }
    isButtonDisabled(state) {
        const date = new Date(state.dateTime.utc.date + "T" + state.dateTime.utc.time + "Z");
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - MetarImportWebComponent.METAR_FETCH_LIMIT_DAYS);
        if (date < fourWeeksAgo || date > new Date()) {
            return true;
        }
        return !state.route.departureAirportCode && !state.route.destinationAirportCode;
    }
    handleClickOrigin = () => {
        this.sendMetar(this.elements.metarOrigin.dataset.icao || "origin");
    };
    handleClickDestination = () => {
        this.sendMetar(this.elements.metarDestination.dataset.icao || "destination");
    };
    async sendMetar(icao) {
        this.elements.dialog.close();
        dispatchNotificationEvent(document.body, `Fetching METAR information for ${icao}`, "waiting");
        const response = await sendToMain("metar:fetch", {
            icao,
        });
        dispatchNotificationEvent(document.body, response.message, response.type);
    }
    static registerElement() {
        registerElement("startgeraet-metar-import", MetarImportWebComponent);
    }
}
