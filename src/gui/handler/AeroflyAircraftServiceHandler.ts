import { IpcMain } from "electron";
import { getAeroflyAircraft, getAllAeroflyAircraftWithLiveries } from "../../core/services/getAeroflyAircraft.js";

export function registerAeroflyAircraftHandlers(ipcMain: IpcMain) {
    ipcMain.handle("aircraft:liveries", (event, aeroflyCode: string) => {
        return getAeroflyAircraft(aeroflyCode)?.liveries ?? [];
    });

    ipcMain.handle("aircraft:update", () => {
        return getAllAeroflyAircraftWithLiveries();
    });
}
