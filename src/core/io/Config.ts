import Conf from "conf";
import os from "node:os";
import path from "node:path";
import fs from "fs";

/**
 * Will test for known paths the `main.mcf` may be located in.
 * @return a matching `main.mcf` path or `null` if path could not be identified
 */
function findMainMcfFilePath(): string | null {
    return [
        path.join(os.homedir(), "Documents", "Aerofly FS 4"), // (Microsoft Windows)
        path.join(
            os.homedir(),
            "Library",
            "Containers",
            "com.aerofly.aerofly-fs-4-mac",
            "Data",
            "Library",
            "Application Support",
            "Aerofly FS 4",
        ), // (Apple macOS, App Store Version)
        path.join(os.homedir(), "Library", "Application Support", "Aerofly FS 4"), // (Apple macOS, Steam Version)
        path.join(os.homedir(), ".config", "Aerofly FS 4"), // (Linux, hidden folder)
    ].reduce((acc: null | string, possiblePath: string) => {
        if (fs.existsSync(possiblePath)) {
            return possiblePath;
        }
        return acc;
    }, null);
}

export type ConfigTheme = "system" | "light" | "dark";

export type ConfigData = {
    mainMcfFilePath: string | null;
    simBriefUserName: string;
    useSimBriefWeather: number;
    importDirectory: string;
    exportDirectory: string;
    syncTimeOnStartup: boolean;
    theme: ConfigTheme;
    lastUpdateCheck: string; // Date.toISOString()
    window: {
        width: number;
        height: number;
        x: number;
        y: number;
    };
    fontSizePercent: number;
    autoSaveDelaySeconds: number;
};

export const CONFIG_DEFAULTS: ConfigData = {
    mainMcfFilePath: String(process.env.AEROFLY_USER_DIRECTORY ?? "") || findMainMcfFilePath(),
    simBriefUserName: String(process.env.SIMBRIEF_USERNAME ?? ""),
    useSimBriefWeather: 0,
    importDirectory: path.join(os.homedir(), "Downloads"),
    exportDirectory: path.join(os.homedir(), "Downloads"),
    syncTimeOnStartup: false,
    theme: "system",
    lastUpdateCheck: new Date("1970-01-01T00:00:00.000Z").toISOString(),
    window: {
        width: 960,
        height: 755,
        x: 0,
        y: 0,
    },
    fontSizePercent: 93.75, // 15px
    autoSaveDelaySeconds: 2,
};

export type ConfigStore = Conf<ConfigData>;

/**
 * Main application configuration. Includes configuration properties
 * as well as persistence handler.
 */
export class Config {
    protected readonly conf: ConfigStore = new Conf({ projectName: "startgeraet" });

    // ----------------------------------------------------------

    /**
     * @returns The file path to the main.mcf file of Aerofly FS 4, which contains the flight plan.
     */
    get mainMcfFilePath(): string | null {
        return this.conf.get("mainMcfFilePath");
    }

    set mainMcfFilePath(mainMcfFilePath: string) {
        this.conf.set("mainMcfFilePath", mainMcfFilePath.trim());
    }

    /**
     * @returns The SimBrief username (or user id) used to import flight plans into Aerofly FS 4.
     */
    get simBriefUserName(): string {
        return this.conf.get("simBriefUserName");
    }

    set simBriefUserName(simBriefUserName: string) {
        this.conf.set("simBriefUserName", simBriefUserName.trim());
    }

    /**
     * @returns 0 for origin, 1 for destination, -1 for none at all
     */
    get useSimBriefWeather(): number {
        return this.conf.get("useSimBriefWeather");
    }

    /**
     * @param useSimBriefWeather 0 for origin, 1 for destination, -1 for none at all
     */
    set useSimBriefWeather(useSimBriefWeather: number) {
        this.conf.set("useSimBriefWeather", useSimBriefWeather);
    }

    get importDirectory(): string {
        return this.conf.get("importDirectory");
    }

    set importDirectory(importDirectory: string) {
        this.conf.set("importDirectory", importDirectory.trim());
    }

    get exportDirectory(): string {
        return this.conf.get("exportDirectory");
    }

    set exportDirectory(exportDirectory: string) {
        this.conf.set("exportDirectory", exportDirectory.trim());
    }

    /**
     * @returns if the simulator time should be set to real-world time on starting the application.
     */
    get syncTimeOnStartup(): boolean {
        return this.conf.get("syncTimeOnStartup");
    }

    set syncTimeOnStartup(syncTimeOnStartup: boolean) {
        this.conf.set("syncTimeOnStartup", syncTimeOnStartup);
    }

    /**
     * @returns the last time the application checked if an update is available
     */
    get lastUpdateCheck(): Date {
        return new Date(this.conf.get("lastUpdateCheck"));
    }

    set lastUpdateCheck(d: Date) {
        this.conf.set("lastUpdateCheck", d.toISOString());
    }

    // ----------------------------------------------------------

    /**
     * @returns the current color mode, e.g. dark mode or light mode.
     */
    get theme(): ConfigTheme {
        return this.conf.get("theme");
    }

    set theme(theme: ConfigTheme) {
        this.conf.set("theme", theme.trim());
    }

    /**
     * @returns GUI windows width in px
     */
    get windowWidth(): number {
        return this.conf.get("window.width");
    }

    set windowWidth(windowWidth) {
        this.conf.set("window.width", windowWidth);
    }

    /**
     * @returns GUI window height in px
     */
    get windowHeight(): number {
        return this.conf.get("window.height");
    }

    set windowHeight(windowHeight) {
        this.conf.set("window.height", windowHeight);
    }

    /**
     * @returns GUI windows position in px. `0` will position the window centered.
     */
    get windowX(): number {
        return this.conf.get("window.x");
    }

    /**
     * @returns GUI windows position in px. `0` will position the window centered.
     */
    set windowX(windowX) {
        this.conf.set("window.x", windowX);
    }

    get windowY(): number {
        return this.conf.get("window.y");
    }

    set windowY(windowY) {
        this.conf.set("window.y", windowY);
    }

    /**
     * @returns GUI font size in percent. 100% is 16px.
     */
    get fontSizePercent(): number {
        return this.conf.get("fontSizePercent");
    }

    set fontSizePercent(fontSizePercent) {
        this.conf.set("fontSizePercent", fontSizePercent);
    }

    // ----------------------------------------------------------

    /**
     * @returns the delay before saving the `main.mcf` after there are no more interactions with GUI components.
     */
    get autoSaveDelaySeconds(): number {
        return this.conf.get("autoSaveDelaySeconds", 2);
    }

    set autoSaveDelaySeconds(autoSaveDelaySeconds) {
        this.conf.set("autoSaveDelaySeconds", Math.max(-1, autoSaveDelaySeconds));
    }

    // ----------------------------------------------------------

    /**
     * @returns if a sufficient cool down has occurred after last update check
     */
    isUpdateCheckNeeded(cooldownHours = 24): boolean {
        const thresholdDate = new Date();
        thresholdDate.setHours(thresholdDate.getHours() - cooldownHours); // 24h have elapsed since last update check
        return thresholdDate > this.lastUpdateCheck;
    }

    toJSON(): ConfigData {
        return this.conf.store;
    }
}

export const CONFIG = new Config();
