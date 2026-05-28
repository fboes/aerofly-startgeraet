import { dispatchNotificationEvent, type NotificationEventPayload } from "../../renderer/notificationEventHandler.js";
import { sendToMain } from "../../renderer/sendToMain.js";

export class ImportWebComponent extends HTMLElement {
    private isInitialized = false;

    private elements!: {
        button: HTMLButtonElement;
    };

    private initialize() {
        this.classList.add("d-flex", "form-group");
        this.innerHTML = `\
<button>Load / import flight plan</button>
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
    }

    disconnectedCallback() {
        this.elements.button.addEventListener("click", this.handleClick);
    }

    handleClick = async () => {
        const response = await sendToMain<NotificationEventPayload>("flightplan:import-file");
        dispatchNotificationEvent(document.body, response.message, response.type);
    };

    static registerElement() {
        customElements.define("startgeraet-import", ImportWebComponent);
    }
}
