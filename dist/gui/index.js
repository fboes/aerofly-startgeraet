import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { ApplicationServiceHandler } from "./handler/ApplicationServiceHandler.js";
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
    switch (process.platform) {
        case "win32":
            win.setIcon(path.join(import.meta.dirname, "../..", "assets/icons/windows/icon.ico"));
            break;
        case "linux":
            win.setIcon(path.join(import.meta.dirname, "../..", "assets/icons/linux/icons/512x512.png"));
            break;
    }
};
app.whenReady().then(() => {
    ApplicationServiceHandler.registerHandler(ipcMain);
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
