import { AeroflyAircraftService } from "../../core/services/AeroflyAircraftService.js";
export class AeroflyAircraftServiceHandler {
    ipcMain;
    win;
    service;
    constructor(ipcMain, win) {
        this.ipcMain = ipcMain;
        this.win = win;
        this.service = new AeroflyAircraftService();
        ipcMain.handle("getLiveries", (event, aeroflyCode) => {
            return this.service.getAircraft(aeroflyCode)?.liveries ?? [];
        });
    }
    sendAllAircraftLiveries() {
        this.win.webContents.send("sendAllAircraftLiveries", this.service.getAllAircraftLiveries());
    }
}
