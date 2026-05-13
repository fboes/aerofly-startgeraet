import { app, BrowserWindow } from "electron";
import path from "node:path";
function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 770,
        titleBarStyle: 'hidden',
        ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    win.loadFile(path.join(import.meta.dirname, "app/index.html"));
    switch (process.platform) {
        case "win32":
            win.setIcon(path.join(import.meta.dirname, "../..", "assets/icons/windows/icon.ico"));
            break;
        case "linux":
            win.setIcon(path.join(import.meta.dirname, "../..", "assets/icons/linux/icons/512x512.png"));
            break;
    }
}
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
