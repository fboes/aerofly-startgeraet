import { NOTIFICATION_EVENT_IDENTIFIER, parseNotificationEvent, } from "../../renderer/notificationEventHandler.js";
import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
import { registerElement } from "./registerElement.js";
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
        output.innerHTML = this.getEmoji(details.type) + "<span></span>";
        output.querySelector("span").innerText = details.message;
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
                return `<startgeraet-icon icon="info"></startgeraet-icon>&nbsp;`;
            case "success":
                return `<startgeraet-icon icon="check"></startgeraet-icon>&nbsp;`;
            case "error":
                return `<startgeraet-icon icon="x"></startgeraet-icon>&nbsp;`;
            case "waiting":
                return `<startgeraet-icon icon="hourglass-split"></startgeraet-icon>&nbsp;`;
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
