import { APPLICATION_INFORMATION } from "../../core/services/getApplicationInformation.js";
import { MISSIONS_GENERATOR_MANIFESTS } from "../../mission-generator/generateFlightplan.js";
export function registerApplicationHandlers(ipcMain) {
    ipcMain.handle("application:get-information", () => {
        return APPLICATION_INFORMATION;
    });
    ipcMain.handle("mission-generator:get-manifests", () => {
        return MISSIONS_GENERATOR_MANIFESTS;
    });
}
