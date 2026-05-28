import { BrowserWindow, type IpcMain } from "electron";
export declare class AeroflyFlightServiceHandler {
    protected ipcMain: IpcMain;
    protected win: BrowserWindow;
    private readonly service;
    private writeTimer;
    private readonly writeDelay;
    constructor(ipcMain: IpcMain, win: BrowserWindow);
    registerHandlers(): void;
    private importSimbrief;
    private importFile;
    private exportFile;
    private fetchMetar;
    sendStateUpdate(): void;
    startDebouncedWriteFile(): void;
}
//# sourceMappingURL=AeroflyFlightServiceHandler.d.ts.map
