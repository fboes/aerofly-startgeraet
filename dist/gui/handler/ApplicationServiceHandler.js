import { getApplicationName, getApplicationVersion } from "../../core/services/ApplicationService.js";
export function registerApplicationHandlers(ipcMain) {
    ipcMain.handle("application:get-name", () => {
        return getApplicationName();
    });
    ipcMain.handle("application:get-version", () => {
        return getApplicationVersion();
    });
}
