import fs from "node:fs/promises";
import path from "node:path";
import type { IpcMain } from "electron";
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

    ipcMain.handle("svg-icon:get", async (event, iconName: string) => {
        return await fs.readFile(
            path.join(DIR_ASSETS, "gui", "icons", path.basename(`icon-${iconName}.svg`)),
            "utf-8",
        );
    });
}
