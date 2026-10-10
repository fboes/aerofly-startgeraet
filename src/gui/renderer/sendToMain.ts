/**
 * Sends a message to the main process and returns the response.
 *
 * @param channel - The channel to send the message to.
 * @param data - The data to send with the message.
 * @returns A promise of type <T> that resolves with the response from the main process.
 */
export async function sendToMain<T>(channel: string, data?: unknown): Promise<T> {
    return window.electronAPI.send(channel, data) as Promise<T>;
}
