import { contextBridge, ipcRenderer } from "electron";
import { AeroflyFlightBridge } from "./util/AeroflyFlightBridge.js";

export type Process = {
    platform: NodeJS.Platform;
};

contextBridge.exposeInMainWorld("process", {
    platform: process.platform,
} as Process);

export type ElectronAPI = {
    send: (channel: string, data?: unknown) => Promise<unknown>;
    onStateUpdate: (callback: (state: AeroflyFlightBridge) => void) => () => void;
};

contextBridge.exposeInMainWorld("electronAPI", {
    send: (channel: string, data?: unknown) => ipcRenderer.invoke(channel, data),
    onStateUpdate: (callback: (state: AeroflyFlightBridge) => void) => {
        ipcRenderer.on("state:update", (_event, state) => callback(state));
        return () => ipcRenderer.removeAllListeners("state:update");
    },
} as ElectronAPI);
