import { BrowserWindow, type IpcMain } from "electron";
import { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
export declare class AeroflyFlightServiceHandler {
    protected ipcMain: IpcMain;
    protected win: BrowserWindow;
    readonly service: AeroflyFlightService;
    constructor(ipcMain: IpcMain, win: BrowserWindow);
    registerHandlers(): void;
    sendStateUpdate(): void;
}
//# sourceMappingURL=AeroflyFlightServiceHandler.d.ts.map
