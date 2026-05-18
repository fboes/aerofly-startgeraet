import { BrowserWindow, IpcMain } from "electron";
import { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
import { Config } from "../../core/io/Config.js";
import { AeroflyFlightBridge } from "../util/AeroflyFlightBridge.js";

export class AeroflyFlightServiceHandler {
    readonly service: AeroflyFlightService;

    constructor(
        protected ipcMain: IpcMain,
        protected win: BrowserWindow,
    ) {
        const config = new Config("electron");
        this.service = new AeroflyFlightService(config);
        this.service.readMainMcf();
    }

    sendFlightplan() {
        this.win.webContents.send("sendFlightplan", new AeroflyFlightBridge(this.service.getAeroflyFlight()));
    }
}
