import { getAeroflyAircraft, getAllAeroflyAircraftWithLiveries } from "../../core/services/getAeroflyAircraft.js";
export function registerAeroflyAircraftHandlers(ipcMain) {
    ipcMain.handle("aircraft:liveries", (event, aeroflyCode) => {
        return getAeroflyAircraft(aeroflyCode)?.liveries ?? [];
    });
    ipcMain.handle("aircraft:update", () => {
        return getAllAeroflyAircraftWithLiveries();
    });
}
