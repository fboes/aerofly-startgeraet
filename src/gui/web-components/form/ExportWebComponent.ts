import { dispatchNotificationEvent, type NotificationEventPayload } from "../../renderer/notificationEventHandler.js";
import { sendToMain } from "../../renderer/sendToMain.js";
import { registerElement } from "../../renderer/registerElement.js";
import { registerShortcut, shortcutString } from "../../renderer/registerShortcut.js";

export class ExportWebComponent extends HTMLElement {
    private isInitialized = false;
    private shortcut: (() => void) | undefined = undefined;
    private readonly shortcutKey = "s";

    private elements!: {
        button: HTMLButtonElement;
    };

    private initialize() {
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button id="flightplan-export" title="${shortcutString(this.shortcutKey)}"><u>S</u>ave / export flight plan</button>
        `;

        this.elements = {
            button: this.querySelector("button") as HTMLButtonElement,
        };
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }

        this.elements.button.addEventListener("click", this.handleClick);
        this.shortcut = registerShortcut(this.shortcutKey, this.handleClick);
    }

    disconnectedCallback() {
        this.elements.button.addEventListener("click", this.handleClick);
        if (this.shortcut) {
            this.shortcut();
        }
    }

    handleClick = async () => {
        const response = await sendToMain<NotificationEventPayload<undefined>>("flightplan:export-file");
        dispatchNotificationEvent(document.body, response.message, response.type);
    };

    static registerElement() {
        registerElement("startgeraet-export", ExportWebComponent);
    }
}
