export type NotificationEventType = "info" | "success" | "error" | "waiting";
export type NotificationEventPayload = {
    message: string;
    type: NotificationEventType;
};
export declare const NOTIFICATION_EVENT_IDENTIFIER = "notification:sent";
/**
 * Create a NotificationEvent via `createNotificationEvent` and dispatch it for the `element`
 * @see createNotificationEvent
 */
export declare function dispatchNotificationEvent(element: HTMLElement, message: string, type?: NotificationEventType): boolean;
/**
 * @param message shown to the user
 * @param type of message, which will change colors and icons on the message
 * @returns a CustomEvent
 */
export declare function createNotificationEvent(message: string, type?: NotificationEventType): CustomEvent;
export declare function createNotificationPayload(message: string, type?: NotificationEventType): NotificationEventPayload;
export declare function createNotificationErrorPayload(error: unknown): NotificationEventPayload;
/**
 * @returns the payload of the event, if it is a NotificationEvent. Otherwise will throw an Error
 */
export declare function parseNotificationEvent(event: Event): NotificationEventPayload;
//# sourceMappingURL=notificationEventHandler.d.ts.map