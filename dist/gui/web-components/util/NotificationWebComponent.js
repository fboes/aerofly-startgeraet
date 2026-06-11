import { NOTIFICATION_EVENT_IDENTIFIER, parseNotificationEvent, } from "../../renderer/notificationEventHandler.js";
import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
export class NotificationWebComponent extends AbstractStateSubscriberWebComponent {
    hideTimer = null;
    hideDelay = 5_000;
    elements;
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
        this.elements.output.classList.remove("info", "success", "error", "waiting");
        this.elements.output.classList.add(details.type, "is-visible");
        this.elements.output.innerText = this.getEmoji(details.type) + details.message;
        if (this.hideTimer !== null) {
            clearTimeout(this.hideTimer);
        }
        this.hideTimer = setTimeout(() => {
            this.elements.output.classList.remove(details.type, "is-visible");
        }, this.hideDelay);
    }
    getEmoji(type) {
        switch (type) {
            case "info":
                return "ℹ️ ";
            case "success":
                return "✅ ";
            case "error":
                return "⛔ ";
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
