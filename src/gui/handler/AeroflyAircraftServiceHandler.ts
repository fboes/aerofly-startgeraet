import { BrowserWindow, IpcMain } from "electron";
import * as AeroflyAircraftService from "../../core/services/AeroflyAircraftService.js";

export class AeroflyAircraftServiceHandler {
    constructor(
        protected ipcMain: IpcMain,
        protected win: BrowserWindow,
    ) {
        ipcMain.handle("getLiveries", (event, aeroflyCode: string) => {
            return AeroflyAircraftService.getAeroflyAircraft(aeroflyCode)?.liveries ?? [];
        });
    }

    sendAllAircraftLiveries() {
        this.win.webContents.send("sendAllAircraftLiveries", AeroflyAircraftService.getAllAeroflyAircraftWithLiveries());
    }
}
