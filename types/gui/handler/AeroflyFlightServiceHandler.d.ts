import { BrowserWindow, IpcMain } from "electron";
import { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
export declare class AeroflyFlightServiceHandler {
    protected ipcMain: IpcMain;
    protected win: BrowserWindow;
    readonly service: AeroflyFlightService;
    constructor(ipcMain: IpcMain, win: BrowserWindow);
    sendFlightplan(): void;
}
//# sourceMappingURL=AeroflyFlightServiceHandler.d.ts.map