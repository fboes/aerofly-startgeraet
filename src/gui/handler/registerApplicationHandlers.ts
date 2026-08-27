import type { IpcMain } from "electron";
import { APPLICATION_INFORMATION } from "../../core/services/getApplicationInformation.js";
import { MISSIONS_GENERATOR_MANIFESTS } from "../../core/io/generateFlightplan.js";

export function registerApplicationHandlers(ipcMain: IpcMain) {
    ipcMain.handle("application:get-information", () => {
        return APPLICATION_INFORMATION;
    });

    ipcMain.handle("mission-generator:get-manifests", () => {
        return MISSIONS_GENERATOR_MANIFESTS;
    });
}
