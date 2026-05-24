import type { IpcMain } from "electron";
import { getApplicationName, getApplicationVersion } from "../../core/services/getApplicationInformation.js";

export function registerApplicationHandlers(ipcMain: IpcMain) {
    ipcMain.handle("application:get-name", () => {
        return getApplicationName();
    });
    ipcMain.handle("application:get-version", () => {
        return getApplicationVersion();
    });
}
