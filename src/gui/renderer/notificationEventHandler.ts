export type NotificationEventType = "info" | "success" | "error" | "waiting";

export type NotificationEventPayload<T> = {
    message: string;
    type: NotificationEventType;
    payload?: T;
};

export const NOTIFICATION_EVENT_IDENTIFIER = "notification:sent";

/**
 * Create a NotificationEvent via `createNotificationEvent` and dispatch it for the `element`
 * @see createNotificationEvent
 */
export function dispatchNotificationEvent<T>(
    element: HTMLElement,
    message: string,
    type: NotificationEventType = "info",
    payload: T = undefined as unknown as T,
): boolean {
    return element.dispatchEvent(createNotificationEvent<T>(message, type, payload));
}

/**
 * @param message shown to the user
 * @param type of message, which will change colors and icons on the message
 * @returns a CustomEvent
 */
export function createNotificationEvent<T>(
    message: string,
    type: NotificationEventType = "info",
    payload: T = undefined as unknown as T,
): CustomEvent {
    return new CustomEvent(NOTIFICATION_EVENT_IDENTIFIER, {
        detail: createNotificationPayload<T>(message, type, payload),
    });
}

export function createNotificationPayload<T>(
    message: string,
    type: NotificationEventType = "info",
    payload: T = undefined as unknown as T,
): NotificationEventPayload<T> {
    return {
        message,
        type,
        payload,
    };
}

export function createNotificationErrorPayload(error: unknown): NotificationEventPayload<undefined> {
    return createNotificationPayload(error instanceof Error ? error.message : "An unknown error occurred", "error");
}

/**
 * @returns the payload of the event, if it is a NotificationEvent. Otherwise will throw an Error
 */
export function parseNotificationEvent<T>(event: Event): NotificationEventPayload<T> {
    if (!(event instanceof CustomEvent) || event.type !== NOTIFICATION_EVENT_IDENTIFIER) {
        throw new Error("Invalid event type, expected " + NOTIFICATION_EVENT_IDENTIFIER);
    }

    return event.detail as NotificationEventPayload<T>;
}
