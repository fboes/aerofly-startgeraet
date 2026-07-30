import { type BrowserWindow, type IpcMain } from "electron";
import { type NotificationEventPayload } from "../renderer/notificationEventHandler.js";
import type { ImportWebComponentPayload } from "../web-components/form/ImportWebComponent.js";
export declare class AeroflyFlightServiceHandler {
    protected ipcMain: IpcMain;
    protected win: BrowserWindow;
    private readonly service;
    private readonly metar;
    private writeTimer;
    private readonly writeDelay;
    private isMissingMainMcf;
    constructor(ipcMain: IpcMain, win: BrowserWindow);
    loadMainMcf(): void;
    writeMainMcf(): void;
    registerHandlers(): void;
    private chooseMainMcfPath;
    private importSimbrief;
    private openDialogAndImportFile;
    importFlightplanFromFile(filepath: string): Promise<NotificationEventPayload<ImportWebComponentPayload | undefined>>;
    private exportFile;
    private fetchMetar;
    private getMetar;
    onClose(): void;
    sendStateUpdate(intial?: boolean): void;
    startDebouncedWriteFile(): void;
}
//# sourceMappingURL=AeroflyFlightServiceHandler.d.ts.map