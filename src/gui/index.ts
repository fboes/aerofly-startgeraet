import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import { AeroflyFlightServiceHandler } from "./handler/AeroflyFlightServiceHandler.js";
import { registerAeroflyAircraftHandlers } from "./handler/registerAeroflyAircraftHandlers.js";
import { registerApplicationHandlers } from "./handler/registerApplicationHandlers.js";
import { IMPORT_FILE_TYPES } from "../core/io/importFlightplan.js";

let fileToOpen: string | null = null;

const createWindow = () => {
    const rootDir = path.join(import.meta.dirname, "../..");
    const win = new BrowserWindow({
        width: 960,
        height: 755,
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
        ...(process.platform !== "darwin" ? { titleBarOverlay: true } : {}),
        webPreferences: {
            sandbox: false,
            preload: path.join(rootDir, "dist/gui/preload.js"),
        },
    });
    win.loadFile(path.join(rootDir, "assets/gui/index.html"));
    //win.webContents.openDevTools();
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith("aerofly-startgeraet")) {
            return { action: "allow" };
        }
        shell.openExternal(url);
        return { action: "deny" };
    });

    switch (process.platform) {
        case "win32":
            win.setIcon(path.join(rootDir, "assets/icons/windows/icon.ico"));
            break;
        case "linux":
            win.setIcon(path.join(rootDir, "assets/icons/linux/icons/512x512.png"));
            break;
    }

    registerApplicationHandlers(ipcMain);
    registerAeroflyAircraftHandlers(ipcMain);
    const aeroflyFlightServiceHandler = new AeroflyFlightServiceHandler(ipcMain, win);

    win.webContents.on("did-finish-load", () => {
        if (fileToOpen) {
            aeroflyFlightServiceHandler.importFlightplanFromFile(fileToOpen);
            fileToOpen = null;
        }
        aeroflyFlightServiceHandler.sendStateUpdate(true);
    });

    win.on("close", () => {
        aeroflyFlightServiceHandler.onClose();
    });
};

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.whenReady().then(() => {
        fileToOpen = process.argv.find((arg) => IMPORT_FILE_TYPES.some((ext) => arg.endsWith(ext))) ?? null;

        createWindow();
        app.on("activate", function () {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    });

    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });
}
