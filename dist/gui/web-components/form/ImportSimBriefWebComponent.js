import { sendToMain } from "../../renderer/sendToMain.js";
import { dispatchNotificationEvent } from "../../renderer/notificationEventHandler.js";
import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export class ImportSimBriefWebComponent extends AbstractStateSubscriberWebComponent {
    isInitialized = false;
    elements;
    initialize() {
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
    <div class="form-group w-100">
        <label for="setting-simbrief-weather">Use SimBrief weather on import</label>
        <select id="setting-simbrief-weather">
            <option value="-1">Do not use SimBrief weather</option>
            <option value="0">Use SimBrief origin weather</option>
            <option value="1">Use SimBrief destination weather</option>
        </select>
    </div>
    <button id="import-simbrief" class="w-100">Import flight plan from SimBrief</button>
  </section>

  <button commandfor="dialog-simbrief" command="close" title="Close">✕</button>
</dialog>
        `;
        this.elements = {
            simBriefUserName: this.querySelector("#settings-simbriefusername"),
            importSimBrief: this.querySelector("#import-simbrief"),
            useSimBriefWeather: this.querySelector("#setting-simbrief-weather"),
            dialog: this.querySelector("dialog"),
        };
    }
    get state() {
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
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener("click", this.handleClick);
    }
    handleClick = async () => {
        const state = this.state;
        if (!state.simBriefUserName) {
            dispatchNotificationEvent(document.body, `Please enter a valid SimBrief username`, "error");
            return;
        }
        this.elements.dialog.close();
        dispatchNotificationEvent(document.body, `Fetching SimBrief settings for user ${state.simBriefUserName}`, "waiting");
        const response = await sendToMain("flightplan:import-simbrief", state);
        dispatchNotificationEvent(document.body, response.message, response.type);
    };
    static registerElement() {
        customElements.define("startgeraet-import-simbrief", ImportSimBriefWebComponent);
    }
}
