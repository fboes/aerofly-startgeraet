import { type NotificationEventPayload } from "../../renderer/notificationEventHandler.js";
import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
export declare class NotificationWebComponent extends AbstractStateSubscriberWebComponent {
    private hideTimer;
    private readonly hideDelay;
    private elements;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleNotification;
    handleNotificationDetails<T>(details: NotificationEventPayload<T>): void;
    private getEmoji;
    private log;
    static registerElement(): void;
}
//# sourceMappingURL=NotificationWebComponent.d.ts.map