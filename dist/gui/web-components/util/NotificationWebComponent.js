import { NOTIFICATION_EVENT_IDENTIFIER, parseNotificationEvent, } from "../../renderer/notificationEventHandler.js";
import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
export class NotificationWebComponent extends AbstractStateSubscriberWebComponent {
    hideDelay = 3_000;
    animiationDuration = 500;
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
                    message: "`main.mcf` not found or not writable. Please use the configuration to set the correct path.",
                    type: "error",
                });
            }
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        document.body.removeEventListener(NOTIFICATION_EVENT_IDENTIFIER, this.handleNotification);
    }
    handleNotification = (event) => {
        const details = parseNotificationEvent(event);
        if (details.message === "") {
            return;
        }
        this.handleNotificationDetails(details);
    };
    handleNotificationDetails(details) {
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
    getEmoji(type) {
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
    log(details) {
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
