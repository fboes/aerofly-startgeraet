import { type BrowserWindow, type IpcMain } from "electron";
export declare class AeroflyFlightServiceHandler {
    protected ipcMain: IpcMain;
    protected win: BrowserWindow;
    private readonly service;
    private writeTimer;
    private readonly writeDelay;
    private isMissingMainMcf;
    constructor(ipcMain: IpcMain, win: BrowserWindow);
    loadMainMcf(): void;
    writeMainMcf(): void;
    registerHandlers(): void;
    private chooseMainMcfPath;
    private importSimbrief;
    private importFile;
    private exportFile;
    private fetchMetar;
    onClose(): void;
    sendStateUpdate(): void;
    startDebouncedWriteFile(): void;
}
//# sourceMappingURL=AeroflyFlightServiceHandler.d.ts.map