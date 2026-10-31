import path from "node:path";
import type { Config } from "../io/Config.js";

export const DIR_ROOT = path.join(import.meta.dirname, "../../..");
export const DIR_ASSETS = path.join(DIR_ROOT, "assets");
export const DIR_ARTIFACTS = path.join(DIR_ROOT, "artifacts");


export function poiDirectory(config: Config) {
    const directory = config.mainMcfFilePath ?? config.importDirectory;
    return path.join(directory, "scenery", "poi");
}
