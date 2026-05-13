import { contextBridge, ipcRenderer } from "electron";

// -----------------------------------------------------------------------------

export type Process = {
    platform: NodeJS.Platform;
};

contextBridge.exposeInMainWorld("process", {
    platform: process.platform,
} as Process);

// -----------------------------------------------------------------------------

export type ApplicationService = {
    getApplicationName: () => Promise<string>;
    getApplicationVersion: () => Promise<string>;
};

contextBridge.exposeInMainWorld("applicationService", {
    getApplicationName: () => ipcRenderer.invoke("getApplicationName"),
    getApplicationVersion: () => ipcRenderer.invoke("getApplicationVersion"),
} as ApplicationService);
