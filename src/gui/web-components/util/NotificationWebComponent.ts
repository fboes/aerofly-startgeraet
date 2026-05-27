import { NOTIFICATION_EVENT_IDENTIFIER, parseNotificationEvent } from "../../renderer/notificationEventHandler.js";

export class NotificationWebComponent extends HTMLElement {
    private hideTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly hideDelay = 5_000;

    private elements: {
        output: HTMLOutputElement;
    };

    constructor() {
        super();
        this.elements = {
            output: document.createElement("output"),
        };
        this.elements.output.role = "alert";
        this.elements.output.ariaLive = "assertive";
        this.elements.output.ariaAtomic = "true";
        this.elements.output.innerText = "Example"; // TODO
        this.appendChild(this.elements.output);
    }

    connectedCallback() {
        document.body.addEventListener(NOTIFICATION_EVENT_IDENTIFIER, this.handleNotification);
        this.addEventListener("click", () => {
            this.elements.output.classList.toggle("is-visible");
        });
    }

    disconnectedCallback(): void {
        document.body.removeEventListener(NOTIFICATION_EVENT_IDENTIFIER, this.handleNotification);
    }

    private handleNotification = (event: Event): void => {
        const details = parseNotificationEvent(event);
        this.elements.output.classList.remove("info", "success", "error", "waiting", "is-visible");
        this.elements.output.classList.add(details.type, "is-visible");
        this.elements.output.innerText = details.message;

        this.hideTimer = setTimeout(() => {
            this.elements.output.classList.remove(details.type, "is-visible");
        }, this.hideDelay);

        switch (details.type) {
            case "error":
                console.error(details.message);
                break;
            case "waiting":
                console.warn(details.message);
                break;
            default:
                console.log(details.message);
                break;
        }
    };

    static registerElement() {
        customElements.define("startgeraet-notification", NotificationWebComponent);
    }
}
