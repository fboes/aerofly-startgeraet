export type NotificationEventType = "info" | "success" | "error" | "waiting";
export type NotificationEventPayload<T> = {
    message: string;
    type: NotificationEventType;
    payload?: T;
};
export declare const NOTIFICATION_EVENT_IDENTIFIER = "notification:sent";
/**
 * Create a NotificationEvent via `createNotificationEvent` and dispatch it for the `element`
 * @see createNotificationEvent
 */
export declare function dispatchNotificationEvent<T>(element: HTMLElement, message: string, type?: NotificationEventType, payload?: T): boolean;
/**
 * @param message shown to the user
 * @param type of message, which will change colors and icons on the message
 * @returns a CustomEvent
 */
export declare function createNotificationEvent<T>(message: string, type?: NotificationEventType, payload?: T): CustomEvent;
export declare function createNotificationPayload<T>(message: string, type?: NotificationEventType, payload?: T): NotificationEventPayload<T>;
export declare function createNotificationErrorPayload(error: unknown): NotificationEventPayload<undefined>;
/**
 * @returns the payload of the event, if it is a NotificationEvent. Otherwise will throw an Error
 */
export declare function parseNotificationEvent<T>(event: Event): NotificationEventPayload<T>;
//# sourceMappingURL=notificationEventHandler.d.ts.map