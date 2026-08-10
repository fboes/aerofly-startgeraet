import { dispatchNotificationEvent } from "../../renderer/notificationEventHandler.js";
import { sendToMain } from "../../renderer/sendToMain.js";
import { registerElement } from "../util/registerElement.js";
export class FlightPlanChooserWebComponent extends HTMLElement {
    isInitialized = false;
    elements;
    get state() {
        return {
            flightPlanIndex: this.elements.flightplanSelect.selectedIndex - 1, // -1 because of the default "Select flightplan" option
            filepath: this.elements.filePath.innerText,
        };
    }
    set values(values) {
        this.elements.filePath.innerText = values.filepath;
        this.elements.flightplanSelect.innerHTML =
            `<option selected disabled value="">Select flightplan</option><hr />` +
                values.flightplans
                    .map((flightplan, index) => `<option value="${index}">${flightplan}</option>`)
                    .join("");
    }
    initialize() {
        this.innerHTML = `\
<dialog id="dialog-fp-choose">
  <h3>Select Flight Plan from File</h3>

  <section class="d-flex">
    <div class="form-group w-100">
        <label for="fp-choose-filepath">File path</label>
        <output id="fp-choose-filepath"></output>
    </div>
    <div class="form-group w-100">
        <label for="fp-choose-flightplan">Flight plan</label>
        <select id="fp-choose-flightplan">
            <option selected disabled value="">Select flightplan</option>
        </select>
    </div>

    <button commandfor="dialog-fp-choose" command="close" title="Close">✕</button>
</dialog>
        `;
        this.elements = {
            filePath: this.querySelector("output"),
            flightplanSelect: this.querySelector("select"),
            dialog: this.querySelector("dialog"),
        };
    }
    open() {
        this.elements.dialog.showModal();
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        this.elements.flightplanSelect.addEventListener("change", this.handleChange);
    }
    disconnectedCallback() {
        this.elements.flightplanSelect.removeEventListener("change", this.handleChange);
    }
    handleChange = async () => {
        const response = await sendToMain("flightplan:import-flightplan-index", this.state);
        dispatchNotificationEvent(document.body, response.message, response.type);
        if (response.type === "success") {
            dispatchNotificationEvent(document.body, "Please remember to set the initial starting position of your aircraft in the simulator.", "info");
        }
        this.elements.dialog.close();
    };
    static registerElement() {
        registerElement("aerofly-flightplan-chooser", FlightPlanChooserWebComponent);
    }
}
