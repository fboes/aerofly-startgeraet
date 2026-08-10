import { dispatchNotificationEvent } from "../../renderer/notificationEventHandler.js";
import { sendToMain } from "../../renderer/sendToMain.js";
import { registerElement } from "../util/registerElement.js";
export class ExportWebComponent extends HTMLElement {
    isInitialized = false;
    elements;
    initialize() {
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button id="flightplan-export">Save / export flight plan</button>
        `;
        this.elements = {
            button: this.querySelector("button"),
        };
    }
    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
        this.elements.button.addEventListener("click", this.handleClick);
    }
    disconnectedCallback() {
        this.elements.button.addEventListener("click", this.handleClick);
    }
    handleClick = async () => {
        const response = await sendToMain("flightplan:export-file");
        dispatchNotificationEvent(document.body, response.message, response.type);
    };
    static registerElement() {
        registerElement("startgeraet-export", ExportWebComponent);
    }
}
