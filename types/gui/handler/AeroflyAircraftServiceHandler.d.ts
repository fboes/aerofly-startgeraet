import { BrowserWindow, IpcMain } from "electron";
export declare class AeroflyAircraftServiceHandler {
    protected ipcMain: IpcMain;
    protected win: BrowserWindow;
    constructor(ipcMain: IpcMain, win: BrowserWindow);
    sendAllAircraftLiveries(): void;
}
//# sourceMappingURL=AeroflyAircraftServiceHandler.d.ts.map