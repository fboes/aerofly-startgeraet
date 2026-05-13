import { IpcMain } from "electron";
import { ApplicationService } from "../../core/services/ApplicationService.js";

export class ApplicationServiceHandler {
    static registerHandler(ipcMain: IpcMain) {
        ipcMain.handle("getApplicationName", () => {
            return ApplicationService.getApplicationName();
        });
        ipcMain.handle("getApplicationVersion", () => {
            return ApplicationService.getApplicationVersion();
        });
    }
}
