import { contextBridge, ipcRenderer } from "electron";
import type { AppState } from "./renderer/AppState.js";

// -----------------------------------------------------------------------------

export type Process = {
    platform: NodeJS.Platform;
};

contextBridge.exposeInMainWorld("process", {
    platform: process.platform,
} as Process);

// -----------------------------------------------------------------------------

export type ElectronAPI = {
    send: (channel: string, data?: unknown) => Promise<unknown>;
    onStateUpdate: (callback: (state: AppState) => void) => () => void;
};

// Keep a single native listener and fan-out to JS callbacks to avoid
// creating multiple native listeners which trigger MaxListeners warnings.
const stateUpdateCallbacks = new Set<(state: AppState) => void>();
let lastState: AppState | null = null;

ipcRenderer.on("state:update", (_event, state) => {
    lastState = state as AppState;
    for (const cb of stateUpdateCallbacks) {
        try {
            cb(lastState);
        } catch (e) {
            console.error("stateUpdate callback error:", e);
        }
    }
});

contextBridge.exposeInMainWorld("electronAPI", {
    send: (channel: string, data?: unknown) => ipcRenderer.invoke(channel, data),
    onStateUpdate: (callback: (state: AppState) => void) => {
        stateUpdateCallbacks.add(callback);
        if (lastState) callback(lastState); // ← replay last known state
        return () => stateUpdateCallbacks.delete(callback);
    },
} as ElectronAPI);
