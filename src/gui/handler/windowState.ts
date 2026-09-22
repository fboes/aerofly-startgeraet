import { type BrowserWindow, screen } from "electron";
import { CONFIG_ELECTRON } from "../io/ConfigElectron.js";

type WindowSize = {
    width: number;
    height: number;
};

type WindowPosition = {
    x: number;
    y: number;
};

/**
 * @returns intitial width and height of main window; possibly also position of window, if this is not ouf of bounds
 */
export function getWindowState(isDev = false) {
    if (isDev) {
        return {
            width: 960,
            height: 755,
        };
    }

    const windowSize = getWindowSize();
    return {
        ...windowSize,
        ...getWindowPosition(windowSize),
    };
}

function getWindowSize(): WindowSize {
    return {
        width: Math.max(100, CONFIG_ELECTRON.windowWidth),
        height: Math.max(100, CONFIG_ELECTRON.windowHeight),
    };
}

function getWindowPosition(windowSize: WindowSize): { x?: number; y?: number } {
    const position = { x: CONFIG_ELECTRON.windowX, y: CONFIG_ELECTRON.windowY };
    if (position.x === 0 && position.y === 0) {
        return {};
    }

    if (!isVisible(windowSize, position)) {
        return {};
    }

    return position;
}

function isVisible(windowSize: WindowSize, position: WindowPosition): boolean {
    const displays = screen.getAllDisplays();
    return displays.some(
        (d) =>
            position.x < d.bounds.x + d.bounds.width &&
            position.x + windowSize.width > d.bounds.x &&
            position.y < d.bounds.y + d.bounds.height &&
            position.y + windowSize.height > d.bounds.y,
    );
}

/**
 *
 * @param win Store this BrowserWindow to the configuration
 */
export function storeWindowState(win: BrowserWindow) {
    const rectangle = win.getBounds();
    CONFIG_ELECTRON.windowWidth = rectangle.width;
    CONFIG_ELECTRON.windowHeight = rectangle.height;
    CONFIG_ELECTRON.windowX = rectangle.x;
    CONFIG_ELECTRON.windowY = rectangle.y;
}
