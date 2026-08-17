import type { AppState } from "../../renderer/AppState.js";
import { dispatchNotificationEvent, type NotificationEventPayload } from "../../renderer/notificationEventHandler.js";
import { sendToMain } from "../../renderer/sendToMain.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";
import { registerShortcut, shortcutString } from "../../renderer/registerShortcut.js";

export type MetarImportWebComponentState = {
    icao: string;
};

export class MetarImportWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized = false;
    private shortcut: (() => void) | undefined = undefined;
    private readonly shortcutKey = "m";
    static readonly METAR_FETCH_LIMIT_DAYS_PAST = 28;
    static readonly TAF_FETCH_LIMIT_DAYS_FUTURE = 28;

    private elements!: {
        metarButton: HTMLButtonElement;
        metarHeading: HTMLHeadingElement;
        metarOrigin: HTMLButtonElement;
        metarOriginLabel: HTMLLabelElement;
        metarDestination: HTMLButtonElement;
        metarDestinationLabel: HTMLLabelElement;
        dialog: HTMLDialogElement;
    };

    private initialize() {
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button commandfor="dialog-metar" command="show-modal">Fetch <u>M</u>ETAR</button>

<dialog id="dialog-metar">
  <h3>Fetch METAR</h3>

  <section class="d-flex">
    <div class="form-group">
       <label for="metar-origin">Fetch METAR for origin</label>
       <button id="metar-origin" title="Fetch METAR for current flight plan origin">Fetch METAR for current flight plan origin</button>
    </div>
    <div class="form-group">
      <label for="metar-destination">Fetch METAR for destination</label>
        <button id="metar-destination" title="Fetch METAR for current flight plan destination">Fetch METAR for current flight plan destination</button>
      </div>
  </section>

  <button commandfor="dialog-metar" command="close" title="Close">✕</button>

  <footer>
    Please note that the METAR API does only provide METAR information for the last ${MetarImportWebComponent.METAR_FETCH_LIMIT_DAYS_PAST} days. The TAF API does only provide TAF information for the next ${MetarImportWebComponent.TAF_FETCH_LIMIT_DAYS_FUTURE} days.<br />
    Also the METAR API does not provide data for all airports worldwide. <br />
  </footer>
</dialog>
        `;
        this.elements = {
            metarButton: this.querySelector("button") as HTMLButtonElement,
            metarHeading: this.querySelector("h3") as HTMLHeadingElement,
            metarOrigin: this.querySelector("#metar-origin") as HTMLButtonElement,
            metarOriginLabel: this.querySelector("label[for='metar-origin']") as HTMLLabelElement,
            metarDestination: this.querySelector("#metar-destination") as HTMLButtonElement,
            metarDestinationLabel: this.querySelector("label[for='metar-destination']") as HTMLLabelElement,
            dialog: this.querySelector("dialog") as HTMLDialogElement,
        };
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
            this.setTitle();
        }

        this.subscribeToStateUpdates((state) => {
            const useTaf = this.isTafRequired(state);

            this.elements.metarButton.disabled = this.isButtonDisabled(state);
            this.elements.metarButton.innerHTML = useTaf ? "Fetch TAF" : "Fetch <u>M</u>ETAR";
            this.elements.metarHeading.textContent = useTaf ? "Fetch TAF" : "Fetch METAR";

            // Origin
            this.elements.metarOriginLabel.textContent = useTaf ? "Fetch TAF for origin" : "Fetch METAR for origin";
            this.elements.metarOrigin.disabled = !state.route.destinationAirportCode;
            this.elements.metarOrigin.textContent = state.route.departureAirport || "Origin";
            this.elements.metarOrigin.dataset.icao = state.route.departureAirportCode || "";

            // Destination
            this.elements.metarDestinationLabel.textContent = useTaf
                ? "Fetch TAF for destination"
                : "Fetch METAR for destination";
            this.elements.metarDestination.disabled = !state.route.destinationAirportCode;
            this.elements.metarDestination.textContent = state.route.destinationAirport || "Destination";
            this.elements.metarDestination.dataset.icao = state.route.destinationAirportCode || "";

            const formGroup = this.elements.metarDestination.closest(".form-group");
            if (formGroup instanceof HTMLElement) {
                formGroup.style.display =
                    state.route.destinationAirportCode == state.route.departureAirportCode ? "none" : "block";
            }

            this.setTitle();
        });

        this.elements.metarOrigin.addEventListener("click", this.handleClickOrigin);
        this.elements.metarDestination.addEventListener("click", this.handleClickDestination);
        this.shortcut = registerShortcut(this.shortcutKey, () => {
            this.elements.dialog.showModal();
        });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.elements.metarOrigin.removeEventListener("click", this.handleClickOrigin);
        this.elements.metarDestination.removeEventListener("click", this.handleClickDestination);
        if (this.shortcut) {
            this.shortcut();
        }
    }

    private setTitle() {
        this.elements.metarButton.title = this.elements.metarButton.disabled
            ? `Cannot fetch METAR weather information because the date is outside the allowed range of ${MetarImportWebComponent.METAR_FETCH_LIMIT_DAYS_PAST} days in the past and ${MetarImportWebComponent.TAF_FETCH_LIMIT_DAYS_FUTURE} days in the future`
            : `Fetch METAR / TAF weather information, ${shortcutString("m")}`;
    }

    /**
     * If the date is in the future, we need to fetch TAF instead of METAR,
     * because METAR is only available for the past.
     */
    private isTafRequired(state: AppState): boolean {
        const date = this.getDate(state);
        return date > new Date();
    }

    private isButtonDisabled(state: AppState): boolean {
        const date = this.getDate(state);
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - MetarImportWebComponent.METAR_FETCH_LIMIT_DAYS_PAST);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + MetarImportWebComponent.TAF_FETCH_LIMIT_DAYS_FUTURE);
        if (date < fourWeeksAgo || date > futureDate) {
            return true;
        }
        return !state.route.departureAirportCode && !state.route.destinationAirportCode;
    }

    private getDate(state: AppState): Date {
        const date = new Date(state.dateTime.utc.date + "T" + state.dateTime.utc.time + "Z");
        return date;
    }

    private handleClickOrigin = () => {
        this.sendMetar(this.elements.metarOrigin.dataset.icao || "origin");
    };

    private handleClickDestination = () => {
        this.sendMetar(this.elements.metarDestination.dataset.icao || "destination");
    };

    private async sendMetar(icao: string) {
        this.elements.dialog.close();
        dispatchNotificationEvent(document.body, `Fetching METAR / TAF information for ${icao}`, "waiting");

        const response = await sendToMain<NotificationEventPayload<undefined>>("metar:fetch", {
            icao,
        });
        dispatchNotificationEvent(document.body, response.message, response.type);
    }

    static registerElement() {
        registerElement("startgeraet-metar-import", MetarImportWebComponent);
    }
}
