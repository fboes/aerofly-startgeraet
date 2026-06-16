/**
 * Main application configuration. Includes configuration properties
 * as well as persistence handler.
 */
export declare class Config {
    private readonly conf;
    /**
     *
     * @param projectName set this to "electron" on Electron app, otherwise use unique project name
     */
    constructor(projectName?: string);
    protected get(key: string, defaultValue?: string): string;
    protected set(key: string, value: string | number): void;
    protected getBoolean(key: string): boolean;
    protected setBoolean(key: string, value: boolean): void;
    protected getNumber(key: string): number;
    protected setNumber(key: string, value: number): void;
    /**
     * @returns The file path to the main.mcf file of Aerofly FS 4, which contains the flight plan.
     */
    get mainMcfFilePath(): string | null;
    set mainMcfFilePath(mainMcfFilePath: string);
    findMainMcfFilePath(): string | null;
    /**
     * @returns The SimBrief username (or user id) used to import flight plans into Aerofly FS 4.
     */
    get simBriefUserName(): string;
    set simBriefUserName(simBriefUserName: string);
    /**
     * @returns 0 for origin, 1 for destination, -1 for none at all
     */
    get useSimBriefWeather(): number;
    /**
     * @param useSimBriefWeather 0 for origin, 1 for destination, -1 for none at all
     */
    set useSimBriefWeather(useSimBriefWeather: number);
    get importDirectory(): string;
    set importDirectory(importDirectory: string);
    get exportDirectory(): string;
    set exportDirectory(exportDirectory: string);
    get syncTimeOnStartup(): boolean;
    set syncTimeOnStartup(syncTimeOnStartup: boolean);
    toJSON(): {
        mainMcfFilePath: string | null;
        simBriefUserName: string;
        useSimBriefWeather: number;
        importDirectory: string;
        exportDirectory: string;
        syncTimeOnStartup: boolean;
    };
}
//# sourceMappingURL=Config.d.ts.map