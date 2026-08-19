import { type BrowserWindow } from "electron";
/**
 * @returns intitial width and height of main window; possibly also position of window, if this is not ouf of bounds
 */
export declare function getWindowState(): {
    x?: number;
    y?: number;
    height: number;
    width: number;
};
/**
 *
 * @param win Store this BrowserWindow to the configuration
 */
export declare function storeWindowState(win: BrowserWindow): void;
//# sourceMappingURL=windowState.d.ts.map