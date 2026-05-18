import { BrowserWindow, IpcMain } from "electron";
import { AeroflyAircraftService } from "../../core/services/AeroflyAircraftService.js";
export declare class AeroflyAircraftServiceHandler {
    protected ipcMain: IpcMain;
    protected win: BrowserWindow;
    readonly service: AeroflyAircraftService;
    constructor(ipcMain: IpcMain, win: BrowserWindow);
    sendAllAircraftLiveries(): void;
}
//# sourceMappingURL=AeroflyAircraftServiceHandler.d.ts.map
