export type NotificationEventType = "info" | "success" | "error" | "waiting";

export type NotificationEventPayload = {
    message: string;
    type: NotificationEventType;
};

export const NOTIFICATION_EVENT_IDENTIFIER = "notification:sent";

/**
 * Create a NotificationEvent via `createNotificationEvent` and dispatch it for the `element`
 * @see createNotificationEvent
 */
export function dispatchNotificationEvent(
    element: HTMLElement,
    message: string,
    type: NotificationEventType = "info",
): boolean {
    return element.dispatchEvent(createNotificationEvent(message, type));
}

/**
 * @param message shown to the user
 * @param type of message, which will change colors and icons on the message
 * @returns a CustomEvent
 */
export function createNotificationEvent(message: string, type: NotificationEventType = "info"): CustomEvent {
    return new CustomEvent(NOTIFICATION_EVENT_IDENTIFIER, {
        detail: createNotificationPayload(message, type),
    });
}

export function createNotificationPayload(
    message: string,
    type: NotificationEventType = "info",
): NotificationEventPayload {
    return {
        message,
        type,
    };
}

export function createNotificationErrorPayload(error: unknown): NotificationEventPayload {
    return createNotificationPayload(error instanceof Error ? error.message : "An unknown error occurred", "error");
}

/**
 * @returns the payload of the event, if it is a NotificationEvent. Otherwise will throw an Error
 */
export function parseNotificationEvent(event: Event): NotificationEventPayload {
    if (!(event instanceof CustomEvent) || event.type !== NOTIFICATION_EVENT_IDENTIFIER) {
        throw Error("Invalid event type, expected " + NOTIFICATION_EVENT_IDENTIFIER);
    }

    return event.detail as NotificationEventPayload;
}
