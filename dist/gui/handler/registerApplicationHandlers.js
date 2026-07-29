import { getApplicationJSON } from "../../core/services/getApplicationInformation.js";
export function registerApplicationHandlers(ipcMain) {
    ipcMain.handle("application:get-information", () => {
        return getApplicationJSON();
    });
}
