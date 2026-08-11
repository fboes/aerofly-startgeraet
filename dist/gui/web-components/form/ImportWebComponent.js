import { dispatchNotificationEvent } from "../../renderer/notificationEventHandler.js";
import { sendToMain } from "../../renderer/sendToMain.js";
import { FlightPlanChooserWebComponent } from "./FlightPlanChooserWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";
export class ImportWebComponent extends HTMLElement {
    isInitialized = false;
    elements;
    initialize() {
        FlightPlanChooserWebComponent.registerElement();
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button>Load / import flight plan</button>
<aerofly-flightplan-chooser></aerofly-flightplan-chooser>
        `;
        this.elements = {
            button: this.querySelector("button"),
            fpChooser: this.querySelector("aerofly-flightplan-chooser"),
        };
        this.elements.fpChooser.style.position = "absolute";
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        this.elements.button.addEventListener("click", this.handleClick);
    }
    disconnectedCallback() {
        this.elements.button.removeEventListener("click", this.handleClick);
    }
    handleClick = async () => {
        const response = await sendToMain("flightplan:import-file");
        dispatchNotificationEvent(document.body, response.message, response.type, response.payload);
        if (response.type === "success") {
            dispatchNotificationEvent(document.body, "Please remember to set the initial starting position of your aircraft in the simulator.", "info");
        }
        if (response.payload) {
            console.log(this.elements.fpChooser);
            this.elements.fpChooser.values = response.payload;
            this.elements.fpChooser.open();
        }
    };
    static registerElement() {
        registerElement("startgeraet-import", ImportWebComponent);
    }
}
