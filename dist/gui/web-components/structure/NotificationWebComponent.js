import { NOTIFICATION_EVENT_IDENTIFIER, parseNotificationEvent } from "../../renderer/notificationEventHandler.js";
export class NotificationWebComponent extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = ``;
    }
    connectedCallback() {
        document.body.addEventListener(NOTIFICATION_EVENT_IDENTIFIER, (event) => {
            const details = parseNotificationEvent(event);
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
        });
    }
    static registerElement() {
        customElements.define("startgeraet-notification", NotificationWebComponent);
    }
}
