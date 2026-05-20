import { bus } from './event-bus.js';
// window.electronAPI wurde von preload.ts bereitgestellt
const api = window.electronAPI;
// Listener registrieren, Cleanup speichern
const cleanup = api.onStateUpdate((state) => {
    bus.emit('state:update', state);
});
// Falls der Renderer-Kontext zerstört wird
window.addEventListener('unload', cleanup);
export async function sendToMain(channel, data) {
    return api.send(channel, data);
}
