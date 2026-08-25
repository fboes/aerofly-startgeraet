import Conf from "conf";
import Store from "electron-store";
import os from "node:os";
import path from "node:path";
import fs from "fs";

export type ConfigTheme = "system" | "light" | "dark";

export type ConfigData = {
    mainMcfFilePath: string | null;
    simBriefUserName: string;
    useSimBriefWeather: number;
    importDirectory: string;
    exportDirectory: string;
    syncTimeOnStartup: boolean;
    theme: ConfigTheme;
    lastUpdateCheck: Date;
    window: {
        width: number;
        height: number;
        x: number;
        y: number;
    };
    fontSizePercent: number;
};

/**
 * Main application configuration. Includes configuration properties
 * as well as persistence handler.
 */
export class Config {
    private readonly conf: Conf | Store;

    /**
     *
     * @param projectName set this to "electron" on Electron app, otherwise use unique project name
     */
    constructor(projectName: string = "startgeraet") {
        this.conf = projectName === "electron" ? new Store() : new Conf({ projectName });
    }

    protected get(key: string, defaultValue: string = ""): string {
        return String(this.conf.get(key, defaultValue));
    }

    protected set(key: string, value: string | number): void {
        this.conf.set(key, value);
    }

    protected getBoolean(key: string): boolean {
        return Boolean(this.conf.get(key, false));
    }

    protected setBoolean(key: string, value: boolean): void {
        this.conf.set(key, value);
    }

    protected getNumber(key: string, defaultValue: number = 0): number {
        return Number(this.conf.get(key, defaultValue));
    }

    protected setNumber(key: string, value: number): void {
        this.conf.set(key, value);
    }

    protected getDate(key: string, defaultValue = "1970-01-01T00:00:00.000Z"): Date {
        return new Date(this.get(key, defaultValue));
    }

    protected setDate(key: string, value: Date): void {
        this.conf.set(key, value.toISOString());
    }

    // ----------------------------------------------------------

    /**
     * @returns The file path to the main.mcf file of Aerofly FS 4, which contains the flight plan.
     */
    get mainMcfFilePath(): string | null {
        return (
            this.get("mainMcfFilePath", String(process.env.AEROFLY_USER_DIRECTORY ?? "")) || this.findMainMcfFilePath()
        );
    }

    set mainMcfFilePath(mainMcfFilePath: string) {
        this.set("mainMcfFilePath", mainMcfFilePath.trim());
    }

    findMainMcfFilePath(): string | null {
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

    /**
     * @returns The SimBrief username (or user id) used to import flight plans into Aerofly FS 4.
     */
    get simBriefUserName(): string {
        return this.get("simBriefUserName", String(process.env.SIMBRIEF_USERNAME));
    }

    set simBriefUserName(simBriefUserName: string) {
        this.set("simBriefUserName", simBriefUserName.trim());
    }

    /**
     * @returns 0 for origin, 1 for destination, -1 for none at all
     */
    get useSimBriefWeather(): number {
        return this.getNumber("useSimBriefWeather");
    }

    /**
     * @param useSimBriefWeather 0 for origin, 1 for destination, -1 for none at all
     */
    set useSimBriefWeather(useSimBriefWeather: number) {
        this.setNumber("useSimBriefWeather", useSimBriefWeather);
    }

    get importDirectory(): string {
        return this.get("importDirectory", path.join(os.homedir(), "Downloads"));
    }

    set importDirectory(importDirectory: string) {
        this.set("importDirectory", importDirectory.trim());
    }

    get exportDirectory(): string {
        return this.get("exportDirectory", this.importDirectory);
    }

    set exportDirectory(exportDirectory: string) {
        this.set("exportDirectory", exportDirectory.trim());
    }

    get syncTimeOnStartup(): boolean {
        return this.getBoolean("syncTimeOnStartup");
    }

    set syncTimeOnStartup(syncTimeOnStartup: boolean) {
        this.setBoolean("syncTimeOnStartup", syncTimeOnStartup);
    }

    get lastUpdateCheck(): Date {
        return this.getDate("lastUpdateCheck");
    }

    set lastUpdateCheck(d: Date) {
        this.setDate("lastUpdateCheck", d);
    }

    get theme(): ConfigTheme {
        return this.get("theme", "system") as ConfigTheme;
    }

    set theme(theme: ConfigTheme) {
        this.set("theme", theme.trim());
    }

    get windowWidth(): number {
        return this.getNumber("window.width", 960);
    }

    set windowWidth(windowWidth) {
        this.setNumber("window.width", windowWidth);
    }

    get windowHeight(): number {
        return this.getNumber("window.height", 755);
    }

    set windowHeight(windowHeight) {
        this.setNumber("window.height", windowHeight);
    }

    get windowX(): number {
        return this.getNumber("window.x");
    }

    set windowX(windowX) {
        this.setNumber("window.x", windowX);
    }

    get windowY(): number {
        return this.getNumber("window.y");
    }

    set windowY(windowY) {
        this.setNumber("window.y", windowY);
    }

    get fontSizePercent(): number {
        return this.getNumber("fontSizePercent", 93.75);
    }

    set fontSizePercent(fontSizePercent) {
        this.setNumber("fontSizePercent", fontSizePercent);
    }

    /**
     * @returns if a sufficient cool down has occured after last update check
     */
    isUpdateCheckNeeded(cooldownHours = 24): boolean {
        const thresholdDate = new Date();
        thresholdDate.setHours(thresholdDate.getHours() - cooldownHours); // 24h have elapsed since last update check
        return thresholdDate > this.lastUpdateCheck;
    }

    toJSON(): ConfigData {
        return this.conf.store as ConfigData;
    }
}
