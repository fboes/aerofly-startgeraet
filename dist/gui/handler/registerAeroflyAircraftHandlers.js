import { getAeroflyAircraft, getAllAeroflyAircraftWithLiveries } from "../../core/services/getAeroflyAircraft.js";
import { getAllAeroflyAirports } from "../../core/services/getAeroflyAirport.js";
export function registerAeroflyAircraftHandlers(ipcMain) {
    ipcMain.handle("aircraft:liveries", (event, aeroflyCode) => {
        return getAeroflyAircraft(aeroflyCode)?.liveries ?? [];
    });
    ipcMain.handle("aircraft:update", () => {
        return getAllAeroflyAircraftWithLiveries();
    });
    ipcMain.handle("airports:get-list", () => {
        return getAllAeroflyAirports();
    });
}
