export async function sendToMain<T>(channel: string, data?: unknown): Promise<T> {
    return window.electronAPI.send(channel, data) as Promise<T>;
}
