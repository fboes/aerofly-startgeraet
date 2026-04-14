import Conf from "conf";
import os from "node:os";
import path from "node:path";
import fs from "fs";

/**
 * Main application configuration. Includes configuration properties
 * as well as persistence handler.
 */
export class Config {
    private conf: Conf;

    constructor(projectName: string = "startgeraet") {
        this.conf = new Conf({ projectName });
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

    // ----------------------------------------------------------

    /**
     * @returns The file path to the main.mcf file of Aerofly FS 4, which contains the flight plan.
     */
    get mainMcfFilePath(): string | null {
        return this.get("mainMcfFilePath", String(process.env.AEROFLY_USER_DIRECTORY)) || this.findMainMcfFilePath();
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
            ), // (Apple Mac OSX, App Store Version)
            path.join(os.homedir(), "Library", "Application Support", "Aerofly FS 4"), // (Apple Mac OSX, Steam Version)
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

    get simBriefWeatherFromDestination(): boolean {
        return this.getBoolean("simBriefWeatherFromDestination");
    }

    set simBriefWeatherFromDestination(simBriefWeatherFromDestination: boolean) {
        this.setBoolean("simBriefWeatherFromDestination", simBriefWeatherFromDestination);
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

    toJSON() {
        return {
            mainMcfFilePath: this.mainMcfFilePath,
            simBriefUserName: this.simBriefUserName,
            simBriefWeatherFromDestination: this.simBriefWeatherFromDestination,
            importDirectory: this.importDirectory,
            exportDirectory: this.exportDirectory,
            syncTimeOnStartup: this.syncTimeOnStartup,
        };
    }
}
