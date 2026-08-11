import { sendToMain } from "../../renderer/sendToMain.js";
import { dispatchNotificationEvent, type NotificationEventPayload } from "../../renderer/notificationEventHandler.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";
import { registerShortcut } from "../../renderer/registerShortcut.js";

export type ImportSimBriefWebComponentState = {
    simBriefUserName: string;
    useSimBriefWeather: number;
};

export class ImportSimBriefWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized = false;
    private shortcut: (() => void) | undefined = undefined;

    private elements!: {
        simBriefUserName: HTMLInputElement;
        importSimBrief: HTMLButtonElement;
        useSimBriefWeather: HTMLSelectElement;
        dialog: HTMLDialogElement;
    };

    private initialize() {
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button commandfor="dialog-simbrief" command="show-modal" title="CTRL+B / OPT+B">Fetch flight plan from <u>S</u>imBrief</button>

<dialog id="dialog-simbrief" closedby="any">
  <h3>Flight plan import</h3>

  <section class="d-flex">
    <p>Remember to generate a flight plan using the <a href="https://dispatch.simbrief.com/" target="simbrief">SimBrief</a> Dispatch before importing.</p>

    <div class="form-group w-100">
      <label for="settings-simbriefusername">SimBrief username</label>
      <input id="settings-simbriefusername" type="text" pattern="[A-Za-z0-9]+" required="required" />
    </div>
    <div class="form-group w-100">
        <label for="setting-simbrief-weather">Use SimBrief weather on import</label>
        <select id="setting-simbrief-weather">
            <option value="-1">Do not use SimBrief weather</option>
            <option value="0">Use SimBrief origin weather</option>
            <option value="1">Use SimBrief destination weather</option>
        </select>
    </div>
    <button id="import-simbrief" class="w-100" autofocus="autofocus">Import flight plan from SimBrief</button>
  </section>

  <button commandfor="dialog-simbrief" command="close" title="Close">✕</button>
</dialog>
        `;
        this.elements = {
            simBriefUserName: this.querySelector("#settings-simbriefusername") as HTMLInputElement,
            importSimBrief: this.querySelector("#import-simbrief") as HTMLButtonElement,
            useSimBriefWeather: this.querySelector("#setting-simbrief-weather") as HTMLSelectElement,
            dialog: this.querySelector("dialog") as HTMLDialogElement,
        };
    }

    get state(): ImportSimBriefWebComponentState {
        return {
            simBriefUserName: this.elements.simBriefUserName.value,
            useSimBriefWeather: this.elements.useSimBriefWeather.selectedIndex - 1,
        };
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        this.subscribeToStateUpdates((state) => {
            this.elements.simBriefUserName.value = state.config.simBriefUserName;
            this.elements.useSimBriefWeather.selectedIndex = state.config.useSimBriefWeather + 1;
        });

        this.elements.importSimBrief.addEventListener("click", this.handleClick);
        this.shortcut = registerShortcut("b", () => {
            this.elements.dialog.showModal();
        });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.removeEventListener("click", this.handleClick);
        if (this.shortcut) {
            this.shortcut();
        }
    }

    private handleClick = async () => {
        const state = this.state;
        if (!state.simBriefUserName) {
            dispatchNotificationEvent(document.body, `Please enter a valid SimBrief username`, "error");
            return;
        }

        this.elements.dialog.close();
        dispatchNotificationEvent(
            document.body,
            `Fetching SimBrief settings for user ${state.simBriefUserName}`,
            "waiting",
        );

        const response = await sendToMain<NotificationEventPayload<undefined>>("flightplan:import-simbrief", state);
        dispatchNotificationEvent(document.body, response.message, response.type);

        if (response.type === "success") {
            dispatchNotificationEvent<undefined>(
                document.body,
                "Please remember to set the initial starting position of your aircraft in the simulator.",
                "info",
            );
        }
    };

    static registerElement() {
        registerElement("startgeraet-import-simbrief", ImportSimBriefWebComponent);
    }
}
