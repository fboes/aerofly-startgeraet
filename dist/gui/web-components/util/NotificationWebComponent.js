import { NOTIFICATION_EVENT_IDENTIFIER, parseNotificationEvent, } from "../../renderer/notificationEventHandler.js";
import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
import { registerElement } from "../../renderer/registerElement.js";
export class NotificationWebComponent extends AbstractStateSubscriberWebComponent {
    hideDelay = 3_500;
    multiHideDelay = 500;
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
        const icon = this.getIcon(details.type);
        output.innerHTML = `<startgeraet-icon icon="${icon}"></startgeraet-icon>&nbsp;<span></span>`;
        output.querySelector("span").innerText = details.message;
        this.appendChild(output);
        // Create function to remove box
        const remove = () => {
            output.addEventListener("transitionend", () => output.remove(), { once: true });
            output.classList.remove("is-visible");
        };
        // Wait for box to be attached, trigger the display animation afterwards
        setTimeout(() => {
            output.classList.add(details.type, "is-visible");
        }, 1);
        // Remove the box automatically after some time
        const removeTimeout = setTimeout(remove, this.hideDelay + (this.childNodes.length - 1) * this.multiHideDelay);
        // Clicking the box removes the box... and the timer for removal
        output.addEventListener("click", () => {
            clearTimeout(removeTimeout);
            remove();
        }, { once: true });
    }
    getIcon(type) {
        switch (type) {
            case "success":
                return "check";
            case "error":
                return "x";
            case "waiting":
                return "hourglass-split";
            default:
                return "info";
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
        registerElement("startgeraet-notification", NotificationWebComponent);
    }
}
