export const NOTIFICATION_EVENT_IDENTIFIER = "notification:sent";
/**
 * Create a NotificationEvent via `createNotificationEvent` and dispatch it for the `element`
 * @see createNotificationEvent
 */
export function dispatchNotificationEvent(element, message, type = "info", payload = undefined) {
    return element.dispatchEvent(createNotificationEvent(message, type, payload));
}
/**
 * @param message shown to the user
 * @param type of message, which will change colors and icons on the message
 * @returns a CustomEvent
 */
export function createNotificationEvent(message, type = "info", payload = undefined) {
    return new CustomEvent(NOTIFICATION_EVENT_IDENTIFIER, {
        detail: createNotificationPayload(message, type, payload),
    });
}
export function createNotificationPayload(message, type = "info", payload = undefined) {
    return {
        message,
        type,
        payload,
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
        throw new Error("Invalid event type, expected " + NOTIFICATION_EVENT_IDENTIFIER);
    }
    return event.detail;
}
