import { dispatchNotificationEvent } from "../../renderer/notificationEventHandler.js";
import { sendToMain } from "../../renderer/sendToMain.js";
import { registerElement } from "../../renderer/registerElement.js";
import { registerShortcut } from "../../renderer/registerShortcut.js";
export class ExportWebComponent extends HTMLElement {
    isInitialized = false;
    shortcut = undefined;
    elements;
    initialize() {
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button id="flightplan-export" title="CTRL+S / OPT+S"><u>S</u>ave / export flight plan</button>
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
        this.shortcut = registerShortcut("s", this.handleClick);
    }
    disconnectedCallback() {
        this.elements.button.addEventListener("click", this.handleClick);
        if (this.shortcut) {
            this.shortcut();
        }
    }
    handleClick = async () => {
        const response = await sendToMain("flightplan:export-file");
        dispatchNotificationEvent(document.body, response.message, response.type);
    };
    static registerElement() {
        registerElement("startgeraet-export", ExportWebComponent);
    }
}
