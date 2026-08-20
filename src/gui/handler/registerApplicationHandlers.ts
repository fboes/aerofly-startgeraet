import type { IpcMain } from "electron";
import { APPLICATION_INFORMATION } from "../../core/services/getApplicationInformation.js";

export function registerApplicationHandlers(ipcMain: IpcMain) {
    ipcMain.handle("application:get-information", () => {
        return APPLICATION_INFORMATION;
    });
}
