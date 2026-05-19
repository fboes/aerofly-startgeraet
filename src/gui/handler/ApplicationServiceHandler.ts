import { IpcMain } from "electron";
import * as ApplicationService from "../../core/services/ApplicationService.js";

export function registerHandler(ipcMain: IpcMain) {
    ipcMain.handle("getApplicationName", () => {
        return ApplicationService.getApplicationName();
    });
    ipcMain.handle("getApplicationVersion", () => {
        return ApplicationService.getApplicationVersion();
    });
}
