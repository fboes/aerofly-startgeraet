import type { IpcMain } from "electron";
import { getAeroflyAircraft, getAllAeroflyAircraftWithLiveries } from "../../core/services/getAeroflyAircraft.js";
import type { AeroflyAirportCoordinatesObject } from "@fboes/aerofly-data/data/airport-coordinates-object.json";
import { getAllAeroflyAirports } from "../../core/services/getAeroflyAirport.js";

export function registerAeroflyAircraftHandlers(ipcMain: IpcMain) {
    ipcMain.handle("aircraft:liveries", (event, aeroflyCode: string) => {
        return getAeroflyAircraft(aeroflyCode)?.liveries ?? [];
    });

    ipcMain.handle("aircraft:update", () => {
        return getAllAeroflyAircraftWithLiveries();
    });

    ipcMain.handle("airports:get-list", (): AeroflyAirportCoordinatesObject[] => {
        return getAllAeroflyAirports();
    });
}
