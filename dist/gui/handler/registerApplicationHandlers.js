import { APPLICATION_INFORMATION } from "../../core/services/getApplicationInformation.js";
export function registerApplicationHandlers(ipcMain) {
    ipcMain.handle("application:get-information", () => {
        return APPLICATION_INFORMATION;
    });
}
