import * as AeroflyAircraftService from "../../core/services/AeroflyAircraftService.js";
export class AeroflyAircraftServiceHandler {
    ipcMain;
    win;
    constructor(ipcMain, win) {
        this.ipcMain = ipcMain;
        this.win = win;
        ipcMain.handle("getLiveries", (event, aeroflyCode) => {
            return AeroflyAircraftService.getAeroflyAircraft(aeroflyCode)?.liveries ?? [];
        });
    }
    sendAllAircraftLiveries() {
        this.win.webContents.send("sendAllAircraftLiveries", AeroflyAircraftService.getAllAeroflyAircraftWithLiveries());
    }
}
