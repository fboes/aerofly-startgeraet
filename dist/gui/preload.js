import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("process", {
    platform: process.platform,
});
contextBridge.exposeInMainWorld("applicationService", {
    getApplicationName: () => ipcRenderer.invoke("getApplicationName"),
    getApplicationVersion: () => ipcRenderer.invoke("getApplicationVersion"),
});
contextBridge.exposeInMainWorld("aeroflyFlightService", {
    onSendFlightplan: (callback) => ipcRenderer.on("sendFlightplan", (event, flightplan) => callback(flightplan)),
});
contextBridge.exposeInMainWorld("aeroflyAircraftService", {
    onSendAllAircraftLiveries: (callback) => ipcRenderer.on("sendAllAircraftLiveries", (event, aircraftLiveries) => callback(aircraftLiveries)),
    getLiveries: (aeroflyCode) => ipcRenderer.invoke("getLiveries", aeroflyCode),
});
// -----------------------------------------------------------------------------
