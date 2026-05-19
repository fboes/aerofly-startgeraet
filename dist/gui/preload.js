import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("process", {
    platform: process.platform,
});
contextBridge.exposeInMainWorld("electronAPI", {
    send: (channel, data) => ipcRenderer.invoke(channel, data),
    onStateUpdate: (callback) => {
        ipcRenderer.on("state:update", (_event, state) => callback(state));
        return () => ipcRenderer.removeAllListeners("state:update");
    },
});
