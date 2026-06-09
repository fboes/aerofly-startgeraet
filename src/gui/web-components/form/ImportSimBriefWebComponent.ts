import { sendToMain } from "../../renderer/sendToMain.js";
import { dispatchNotificationEvent, type NotificationEventPayload } from "../../renderer/notificationEventHandler.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";

export type ImportSimBriefWebComponentState = {
    simBriefUserName: string;
};

export class ImportSimBriefWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized = false;

    private elements!: {
        simBriefUserName: HTMLInputElement;
        importSimBrief: HTMLButtonElement;
        dialog: HTMLDialogElement;
    };

    private initialize() {
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button commandfor="dialog-simbrief" command="show-modal">Fetch flight plan from SimBrief</button>

<dialog id="dialog-simbrief" closedby="any">
  <h3>Flight plan import</h3>

  <section class="d-flex">
    <div class="form-group w-100">
      <label for="settings-simbriefusername">SimBrief username</label>
      <input id="settings-simbriefusername" type="text" pattern="[A-Za-z0-9]+" required="required" />
    </div>
    <button id="import-simbrief" class="w-100">Import flight plan from SimBrief</button>
  </section>

  <button commandfor="dialog-simbrief" command="close" title="Close">✕</button>
</dialog>
        `;
        this.elements = {
            simBriefUserName: this.querySelector("#settings-simbriefusername") as HTMLInputElement,
            importSimBrief: this.querySelector("#import-simbrief") as HTMLButtonElement,
            dialog: this.querySelector("dialog") as HTMLDialogElement,
        };
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        this.subscribeToStateUpdates((state) => {
            this.elements.simBriefUserName.value = state.config.simBriefUserName;
        });

        this.elements.importSimBrief.addEventListener("click", this.handleClick);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.removeEventListener("click", this.handleClick);
    }

    private handleClick = async () => {
        const simBriefUserName = this.elements.simBriefUserName.value;
        if (!simBriefUserName) {
            dispatchNotificationEvent(document.body, `Please enter a valid SimBrief username`, "error");
            return;
        }

        this.elements.dialog.close();
        dispatchNotificationEvent(document.body, `Fetching SimBrief settings for user ${simBriefUserName}`, "waiting");

        const response = await sendToMain<NotificationEventPayload<undefined>>("flightplan:import-simbrief", {
            simBriefUserName,
        });
        dispatchNotificationEvent(document.body, response.message, response.type);
    };

    static registerElement() {
        customElements.define("startgeraet-import-simbrief", ImportSimBriefWebComponent);
    }
}
