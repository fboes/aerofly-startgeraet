import { contextBridge, ipcRenderer } from "electron";
import { AeroflyFlightBridge } from "./util/AeroflyFlightBridge.js";
import { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";

/**
 * @see https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-2-renderer-to-main-two-way
 */

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

// -----------------------------------------------------------------------------

export type AeroflyFlightService = {
    onSendFlightplan: (callback: (flightplan: AeroflyFlightBridge) => void) => void;
};

contextBridge.exposeInMainWorld("aeroflyFlightService", {
    onSendFlightplan: (callback) => ipcRenderer.on("sendFlightplan", (event, flightplan) => callback(flightplan)),
} as AeroflyFlightService);

// -----------------------------------------------------------------------------

export type AeroflyAircraftService = {
    onSendAllAircraftLiveries: (callback: (aircraftLiveries: AeroflyAircraft[]) => void) => void;
    getLiveries: (aeroflyCode: string) => Promise<AeroflyAircraftLivery[]>;
};

contextBridge.exposeInMainWorld("aeroflyAircraftService", {
    onSendAllAircraftLiveries: (callback) =>
        ipcRenderer.on("sendAllAircraftLiveries", (event, aircraftLiveries) => callback(aircraftLiveries)),
    getLiveries: (aeroflyCode) => ipcRenderer.invoke("getLiveries", aeroflyCode),
} as AeroflyAircraftService);

// -----------------------------------------------------------------------------
