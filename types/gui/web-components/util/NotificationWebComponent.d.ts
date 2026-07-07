import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
export declare class NotificationWebComponent extends AbstractStateSubscriberWebComponent {
    private readonly hideDelay;
    private readonly animiationDuration;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleNotification;
    private handleNotificationDetails;
    private getEmoji;
    private log;
    static registerElement(): void;
}
//# sourceMappingURL=NotificationWebComponent.d.ts.map