import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import { AeroflyFlightServiceHandler } from "./handler/AeroflyFlightServiceHandler.js";
import { registerAeroflyAircraftHandlers } from "./handler/registerAeroflyAircraftHandlers.js";
import { registerApplicationHandlers } from "./handler/registerApplicationHandlers.js";
import { IMPORT_FILE_TYPES } from "../core/io/importFlightplan.js";
import { getWindowState, storeWindowState } from "./handler/windowState.js";
import { APPLICATION_INFORMATION } from "../core/services/getApplicationInformation.js";
import { DIR_ASSETS, DIR_ROOT } from "../core/util/directory.js";

let fileToOpen: string | null = null;
let flightService: AeroflyFlightServiceHandler | null = null;

function findImportFile(argv: string[]) {
    return argv.find((arg) => IMPORT_FILE_TYPES.some((ext) => arg.endsWith(ext))) ?? null;
}

function openFile(file: string) {
    if (flightService) {
        flightService.importFlightplanFromFile(file);
    } else {
        fileToOpen = file; // picked up in did-finish-load
    }
}

function createWindow() {
    const win = new BrowserWindow({
        ...getWindowState(APPLICATION_INFORMATION.isDev),
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
        ...(process.platform !== "darwin" ? { titleBarOverlay: true } : {}),
        webPreferences: {
            sandbox: false,
            preload: path.join(DIR_ROOT, "dist/gui/preload.js"),
        },
    });
    win.loadFile(path.join(DIR_ASSETS, "gui/index.html"));

    if (APPLICATION_INFORMATION.isDev) {
        win.webContents.openDevTools();
    }
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith("aerofly-startgeraet")) {
            return { action: "allow" };
        }
        shell.openExternal(url);
        return { action: "deny" };
    });

    switch (process.platform) {
        case "win32":
            win.setIcon(path.join(DIR_ASSETS, "icons/windows/icon.ico"));
            break;
        case "linux":
            win.setIcon(path.join(DIR_ASSETS, "icons/linux/icons/512x512.png"));
            break;
    }

    const service = new AeroflyFlightServiceHandler(ipcMain, win);

    win.webContents.on("did-finish-load", () => {
        flightService = service;
        if (fileToOpen) {
            service.importFlightplanFromFile(fileToOpen);
            fileToOpen = null;
        }
        service.sendStateUpdate(true);
    });

    win.on("close", () => {
        flightService = null;
        service.onClose();
        storeWindowState(win);
    });
}

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on("open-file", (event, file) => {
        // macOS, before ready
        event.preventDefault();
        if (app.isReady() && BrowserWindow.getAllWindows().length === 0) {
            fileToOpen = file;
            createWindow();
        } else {
            openFile(file);
        }
    });

    app.on("second-instance", (_event, argv) => {
        // Windows/Linux
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
        const file = findImportFile(argv);
        if (file) {
            openFile(file);
        }
    });

    app.whenReady().then(() => {
        fileToOpen ??= findImportFile(process.argv);

        registerApplicationHandlers(ipcMain);
        registerAeroflyAircraftHandlers(ipcMain);
        createWindow();

        app.on("activate", () => {
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
