import {
    NOTIFICATION_EVENT_IDENTIFIER,
    parseNotificationEvent,
    type NotificationEventPayload,
    type NotificationEventType,
} from "../../renderer/notificationEventHandler.js";
import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";

export class NotificationWebComponent extends AbstractStateSubscriberWebComponent {
    private readonly hideDelay = 3_000;
    private readonly animiationDuration = 500;

    constructor() {
        super();
        this.role = "alert";
        this.ariaLive = "assertive";
        this.ariaAtomic = "true";
    }

    connectedCallback() {
        document.body.addEventListener(NOTIFICATION_EVENT_IDENTIFIER, this.handleNotification);

        this.subscribeToStateUpdates((state) => {
            if (state.isMissingMainMcf) {
                this.handleNotificationDetails({
                    message:
                        "`main.mcf` not found or not writable. Please use the configuration to set the correct path.",
                    type: "error",
                });
            }
        });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        document.body.removeEventListener(NOTIFICATION_EVENT_IDENTIFIER, this.handleNotification);
    }

    private handleNotification = (event: Event): void => {
        const details = parseNotificationEvent(event);
        if (details.message === "") {
            return;
        }

        this.handleNotificationDetails(details);
    };

    private handleNotificationDetails<T>(details: NotificationEventPayload<T>) {
        this.log(details);

        const output = document.createElement("output");
        output.innerText = this.getEmoji(details.type) + details.message;
        this.appendChild(output);

        setTimeout(() => {
            output.classList.add(details.type, "is-visible");
        }, 1);

        setTimeout(() => {
            output.classList.remove("is-visible");

            setTimeout(() => {
                output.remove();
            }, this.animiationDuration);
        }, this.hideDelay);
    }

    private getEmoji(type: NotificationEventType) {
        switch (type) {
            case "info":
                return "ℹ️ ";
            case "success":
                return "✓ ";
            case "error":
                return "✗ ";
            case "waiting":
                return "⏳ ";
        }
    }

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
