import {
    NOTIFICATION_EVENT_IDENTIFIER,
    parseNotificationEvent,
    type NotificationEventPayload,
} from "../../renderer/notificationEventHandler.js";

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
        if (details.message === "") {
            return;
        }

        this.log(details);

        this.elements.output.classList.remove("info", "success", "error", "waiting");
        this.elements.output.classList.add(details.type, "is-visible");
        this.elements.output.innerText = details.message;

        if (this.hideTimer !== null) {
            clearTimeout(this.hideTimer);
        }
        this.hideTimer = setTimeout(() => {
            this.elements.output.classList.remove(details.type, "is-visible");
        }, this.hideDelay);
    };

    private log<T>(details: NotificationEventPayload<T>): void {
        switch (details.type) {
            case "error":
                console.error(details.message, details.payload);
                break;
            case "waiting":
                console.warn(details.message, details.payload);
                break;
            default:
                console.log(details.message, details.payload);
                break;
        }
    }

    static registerElement() {
        customElements.define("startgeraet-notification", NotificationWebComponent);
    }
}
