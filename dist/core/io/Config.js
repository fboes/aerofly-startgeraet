import Conf from "conf";
import Store from "electron-store";
import os from "node:os";
import path from "node:path";
import fs from "fs";
/**
 * Main application configuration. Includes configuration properties
 * as well as persistence handler.
 */
export class Config {
    conf;
    /**
     *
     * @param projectName set this to "electron" on Electron app, otherwise use unique project name
     */
    constructor(projectName = "startgeraet") {
        this.conf = projectName === "electron" ? new Store() : new Conf({ projectName });
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
    getNumber(key) {
        return Number(this.conf.get(key, 0));
    }
    setNumber(key, value) {
        this.conf.set(key, value);
    }
    getDate(key) {
        return new Date(this.get(key, "1970-01-01T00:00:00.000Z"));
    }
    setDate(key, value) {
        this.conf.set(key, value.toISOString());
    }
    // ----------------------------------------------------------
    /**
     * @returns The file path to the main.mcf file of Aerofly FS 4, which contains the flight plan.
     */
    get mainMcfFilePath() {
        return (this.get("mainMcfFilePath", String(process.env.AEROFLY_USER_DIRECTORY ?? "")) || this.findMainMcfFilePath());
    }
    set mainMcfFilePath(mainMcfFilePath) {
        this.set("mainMcfFilePath", mainMcfFilePath.trim());
    }
    findMainMcfFilePath() {
        return [
            path.join(os.homedir(), "Documents", "Aerofly FS 4"), // (Microsoft Windows)
            path.join(os.homedir(), "Library", "Containers", "com.aerofly.aerofly-fs-4-mac", "Data", "Library", "Application Support", "Aerofly FS 4"), // (Apple macOS, App Store Version)
            path.join(os.homedir(), "Library", "Application Support", "Aerofly FS 4"), // (Apple macOS, Steam Version)
            path.join(os.homedir(), ".config", "Aerofly FS 4"), // (Linux, hidden folder)
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
        return this.get("simBriefUserName", String(process.env.SIMBRIEF_USERNAME));
    }
    set simBriefUserName(simBriefUserName) {
        this.set("simBriefUserName", simBriefUserName.trim());
    }
    /**
     * @returns 0 for origin, 1 for destination, -1 for none at all
     */
    get useSimBriefWeather() {
        return this.getNumber("useSimBriefWeather");
    }
    /**
     * @param useSimBriefWeather 0 for origin, 1 for destination, -1 for none at all
     */
    set useSimBriefWeather(useSimBriefWeather) {
        this.setNumber("useSimBriefWeather", useSimBriefWeather);
    }
    get importDirectory() {
        return this.get("importDirectory", path.join(os.homedir(), "Downloads"));
    }
    set importDirectory(importDirectory) {
        this.set("importDirectory", importDirectory.trim());
    }
    get exportDirectory() {
        return this.get("exportDirectory", this.importDirectory);
    }
    set exportDirectory(exportDirectory) {
        this.set("exportDirectory", exportDirectory.trim());
    }
    get syncTimeOnStartup() {
        return this.getBoolean("syncTimeOnStartup");
    }
    set syncTimeOnStartup(syncTimeOnStartup) {
        this.setBoolean("syncTimeOnStartup", syncTimeOnStartup);
    }
    get lastUpdateCheck() {
        return this.getDate("lastUpdateCheck");
    }
    set lastUpdateCheck(d) {
        this.setDate("lastUpdateCheck", d);
    }
    get theme() {
        return this.get("theme", "system");
    }
    set theme(theme) {
        this.set("theme", theme.trim());
    }
    /**
     * @returns if a sufficient cool down has occured after last update check
     */
    isUpdateCheckNeeded(cooldownHours = 24) {
        const thresholdDate = new Date();
        thresholdDate.setHours(thresholdDate.getHours() - cooldownHours); // 24h have elapsed since last update check
        return thresholdDate > this.lastUpdateCheck;
    }
    toJSON() {
        return {
            mainMcfFilePath: this.mainMcfFilePath,
            simBriefUserName: this.simBriefUserName,
            useSimBriefWeather: this.useSimBriefWeather,
            importDirectory: this.importDirectory,
            exportDirectory: this.exportDirectory,
            syncTimeOnStartup: this.syncTimeOnStartup,
            theme: this.theme,
            lastUpdateCheck: this.lastUpdateCheck,
        };
    }
}
