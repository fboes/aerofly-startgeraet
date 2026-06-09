import { contextBridge, ipcRenderer } from "electron";
import { AppState } from "./renderer/AppState.js";
contextBridge.exposeInMainWorld("process", {
    platform: process.platform,
});
// Keep a single native listener and fan-out to JS callbacks to avoid
// creating multiple native listeners which trigger MaxListeners warnings.
const stateUpdateCallbacks = new Set();
let lastState = null;
ipcRenderer.on("state:update", (_event, state) => {
    lastState = state;
    for (const cb of stateUpdateCallbacks) {
        try {
            cb(lastState);
        }
        catch (e) {
            console.error("stateUpdate callback error:", e);
        }
    }
});
contextBridge.exposeInMainWorld("electronAPI", {
    send: (channel, data) => ipcRenderer.invoke(channel, data),
    onStateUpdate: (callback) => {
        stateUpdateCallbacks.add(callback);
        if (lastState)
            callback(lastState); // ← replay last known state
        return () => stateUpdateCallbacks.delete(callback);
    },
});
