export const NOTIFICATION_EVENT_IDENTIFIER = "notification:sent";
/**
 * Create a NotificationEvent via `createNotificationEvent` and dispatch it for the `element`
 * @see createNotificationEvent
 */
export function dispatchNotificationEvent(element, message, type = "info") {
    return element.dispatchEvent(createNotificationEvent(message, type));
}
/**
 * @param message shown to the user
 * @param type of message, which will change colors and icons on the message
 * @returns a CustomEvent
 */
export function createNotificationEvent(message, type = "info") {
    return new CustomEvent(NOTIFICATION_EVENT_IDENTIFIER, {
        detail: createNotificationPayload(message, type),
    });
}
export function createNotificationPayload(message, type = "info") {
    return {
        message,
        type,
    };
}
export function createNotificationErrorPayload(error) {
    return createNotificationPayload(error instanceof Error ? error.message : "An unknown error occurred", "error");
}
/**
 * @returns the payload of the event, if it is a NotificationEvent. Otherwise will throw an Error
 */
export function parseNotificationEvent(event) {
    if (!(event instanceof CustomEvent) || event.type !== NOTIFICATION_EVENT_IDENTIFIER) {
        throw Error("Invalid event type, expected " + NOTIFICATION_EVENT_IDENTIFIER);
    }
    return event.detail;
}
