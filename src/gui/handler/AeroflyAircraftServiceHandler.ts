import { BrowserWindow, IpcMain } from "electron";
import { AeroflyAircraftService } from "../../core/services/AeroflyAircraftService.js";

export class AeroflyAircraftServiceHandler {
    readonly service: AeroflyAircraftService;

    constructor(
        protected ipcMain: IpcMain,
        protected win: BrowserWindow,
    ) {
        this.service = new AeroflyAircraftService();

        ipcMain.handle("getLiveries", (event, aeroflyCode: string) => {
            return this.service.getAircraft(aeroflyCode)?.liveries ?? [];
        });
    }

    sendAllAircraftLiveries() {
        this.win.webContents.send("sendAllAircraftLiveries", this.service.getAllAircraftLiveries());
    }
}
