import Conf from "conf";
import os from "node:os";
import path from "node:path";
import fs from "fs";
export class Config {
    constructor(projectName = "startgeraet") {
        this.conf = new Conf({ projectName });
    }
    get(key, defaultValue = "") {
        return String(this.conf.get(key, defaultValue));
    }
    set(key, value) {
        this.conf.set(key, value);
    }
    getBoolean(key) {
        return Boolean(this.conf.get(key, false));
    }
    setBoolean(key, value) {
        this.conf.set(key, value);
    }
    // ----------------------------------------------------------
    /**
     * @returns The file path to the main.mcf file of Aerofly FS 4, which contains the flight plan. This is needed to import flight plans from SimBrief into Aerofly FS 4.
     */
    get mainMcfFilePath() {
        return this.get("mainMcfFilePath", "") || this.findMainMcfFilePath();
    }
    set mainMcfFilePath(mainMcfFilePath) {
        this.set("mainMcfFilePath", mainMcfFilePath);
    }
    findMainMcfFilePath() {
        return [
            path.join(os.homedir(), "Documents", "Aerofly FS 4"), // (Microsoft Windows)
            path.join(os.homedir(), "Library", "Containers", "com.aerofly.aerofly-fs-4-mac", "Data", "Library", "Application Support", "Aerofly FS 4"), // (Apple Mac OSX, App Store Version)
            path.join(os.homedir(), "Library", "Application Support", "Aerofly FS 4"), // (Apple Mac OSX, Steam Version)
        ].reduce((acc, possiblePath) => {
            if (fs.existsSync(possiblePath)) {
                return possiblePath;
            }
            return acc;
        }, null);
    }
    /**
     * @returns The SimBrief username (or user id) used to import flight plans into Aerofly FS 4.
     */
    get simBriefUserName() {
        return this.get("simBriefUserName", "");
    }
    set simBriefUserName(simBriefUserName) {
        this.set("simBriefUserName", simBriefUserName);
    }
    get simBriefWeatherFromDestination() {
        return this.getBoolean("simBriefWeatherFromDestination");
    }
    set simBriefWeatherFromDestination(simBriefWeatherFromDestination) {
        this.setBoolean("simBriefWeatherFromDestination", simBriefWeatherFromDestination);
    }
    get importDirectory() {
        return this.get("importDirectory", path.join(os.homedir(), "Downloads"));
    }
    set importDirectory(importDirectory) {
        this.set("importDirectory", importDirectory);
    }
    get syncTimeOnStartup() {
        return this.getBoolean("syncTimeOnStartup");
    }
    set syncTimeOnStartup(syncTimeOnStartup) {
        this.setBoolean("syncTimeOnStartup", syncTimeOnStartup);
    }
}
