export async function sendToMain(channel, data) {
    return window.electronAPI.send(channel, data);
}
