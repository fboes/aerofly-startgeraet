import type { IpcMain } from "electron";
import { getApplicationJSON } from "../../core/services/getApplicationInformation.js";

export function registerApplicationHandlers(ipcMain: IpcMain) {
    ipcMain.handle("application:get-information", () => {
        return getApplicationJSON();
    });
}
