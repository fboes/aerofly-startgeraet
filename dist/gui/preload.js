import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("process", {
    platform: process.platform,
});
contextBridge.exposeInMainWorld("applicationService", {
    getApplicationName: () => ipcRenderer.invoke("getApplicationName"),
    getApplicationVersion: () => ipcRenderer.invoke("getApplicationVersion"),
});
