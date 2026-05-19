import * as ApplicationService from "../../core/services/ApplicationService.js";
export function registerHandler(ipcMain) {
    ipcMain.handle("getApplicationName", () => {
        return ApplicationService.getApplicationName();
    });
    ipcMain.handle("getApplicationVersion", () => {
        return ApplicationService.getApplicationVersion();
    });
}
