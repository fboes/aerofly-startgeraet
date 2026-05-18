import { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
import { Config } from "../../core/io/Config.js";
import { AeroflyFlightBridge } from "../util/AeroflyFlightBridge.js";
export class AeroflyFlightServiceHandler {
    ipcMain;
    win;
    service;
    constructor(ipcMain, win) {
        this.ipcMain = ipcMain;
        this.win = win;
        const config = new Config("electron");
        this.service = new AeroflyFlightService(config);
        this.service.readMainMcf();
    }
    sendFlightplan() {
        this.win.webContents.send("sendFlightplan", new AeroflyFlightBridge(this.service.getAeroflyFlight()));
    }
}
