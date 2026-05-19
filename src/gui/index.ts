import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { AeroflyFlightServiceHandler } from "./handler/AeroflyFlightServiceHandler.js";
import { registerAeroflyAircraftHandlers } from "./handler/AeroflyAircraftServiceHandler.js";
import { registerApplicationHandlers } from "./handler/ApplicationServiceHandler.js";

const createWindow = () => {
    const win = new BrowserWindow({
        width: 900,
        height: 780,
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
        ...(process.platform !== "darwin" ? { titleBarOverlay: true } : {}),
        webPreferences: {
            sandbox: false,
            preload: path.join(import.meta.dirname, "preload.js"),
        },
    });
    win.loadFile(path.join(import.meta.dirname, "index.html"));
    win.webContents.openDevTools(); // TODO: Remove this line before production

    switch (process.platform) {
        case "win32":
            win.setIcon(path.join(import.meta.dirname, "../..", "assets/icons/windows/icon.ico"));
            break;
        case "linux":
            win.setIcon(path.join(import.meta.dirname, "../..", "assets/icons/linux/icons/512x512.png"));
            break;
    }

    registerApplicationHandlers(ipcMain);
    registerAeroflyAircraftHandlers(ipcMain);
    const aeroflyFlightServiceHandler = new AeroflyFlightServiceHandler(ipcMain, win);

    win.webContents.on("did-finish-load", () => {
        aeroflyFlightServiceHandler.sendFlightplan();
    });
};

app.whenReady().then(() => {
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
