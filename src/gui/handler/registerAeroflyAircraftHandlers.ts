import type { IpcMain } from "electron";
import { findAeroflyAircraft, getAllAeroflyAircraftWithLiveries } from "../../core/services/getAeroflyAircraft.js";
import { getAllAeroflyAirports } from "../../core/services/getAeroflyAirport.js";

export function registerAeroflyAircraftHandlers(ipcMain: IpcMain) {
    ipcMain.handle("aircraft:liveries", (event, aeroflyCode: string) => {
        return findAeroflyAircraft(aeroflyCode)?.liveries ?? [];
    });

    ipcMain.handle("aircraft:update", getAllAeroflyAircraftWithLiveries);

    ipcMain.handle("airports:get-list", getAllAeroflyAirports);
}
