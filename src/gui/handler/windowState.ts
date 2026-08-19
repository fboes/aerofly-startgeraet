import { type BrowserWindow, screen } from "electron";
import { Config } from "../../core/io/Config.js";

const config = new Config("electron");

type WindowSize = {
    height: number;
    width: number;
};

type WindowPosition = {
    x: number;
    y: number;
};

/**
 * @returns intitial width and height of main window; possibly also position of window, if this is not ouf of bounds
 */
export function getWindowState() {
    const windowSize = getWindowSize();
    return {
        ...windowSize,
        ...getWindowPosition(windowSize),
    };
}

function getWindowSize(): WindowSize {
    return {
        width: Math.max(100, config.windowWidth),
        height: Math.max(100, config.windowHeight),
    };
}

function getWindowPosition(windowSize: WindowSize): { x?: number; y?: number } {
    const position = { x: config.windowX, y: config.windowY };
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
    config.windowWidth = rectangle.width;
    config.windowHeight = rectangle.height;
    config.windowX = rectangle.x;
    config.windowY = rectangle.y;
}
