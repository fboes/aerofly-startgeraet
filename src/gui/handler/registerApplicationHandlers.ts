import fs from "node:fs/promises";
import path from "node:path";
import type { IpcMain, IpcMainInvokeEvent } from "electron";
import { APPLICATION_INFORMATION } from "../../core/services/getApplicationInformation.js";
import { MISSIONS_GENERATOR_MANIFESTS } from "../../mission-generator/MissionGenerator.js";
import { DIR_ASSETS } from "../../core/util/directory.js";

export function registerApplicationHandlers(ipcMain: IpcMain) {
    ipcMain.handle("application:get-information", () => {
        return APPLICATION_INFORMATION;
    });

    ipcMain.handle("mission-generator:get-manifests", () => {
        return MISSIONS_GENERATOR_MANIFESTS;
    });

    ipcMain.handle("svg-icon:get", svgIconGet);
}

/**
 * @param iconName to return SVG for
 * @returns SVG content for inline embedding, from the asset directory.
 *   Inkscape XML will be removed, as well as IDs.
 */
async function svgIconGet(event: IpcMainInvokeEvent, iconName: string): Promise<string> {
    const svg = await fs.readFile(
        path.join(DIR_ASSETS, "gui", "icons", path.basename(`icon-${iconName}.svg`)),
        "utf-8",
    );

    return svg
        .replace(/<\?xml[^>]*\?>/gs, "")
        .replace(/\s+(id|style|xmlns)="[^"]*"/gs, "")
        .replace(/\s*<sodipodi:namedview.+<\/sodipodi:namedview>/gs, "")
        .replace(/\s*<(sodipodi:namedview|defs)[^>]+\/>/gs, "")
        .replace(/\s+(inkscape|sodipodi):[a-z\-]+="[^"]*"/gsv, "")
        .replace(/\s+xmlns:(inkscape|sodipodi|svg)="[^"]*"/gsv, "");
}
