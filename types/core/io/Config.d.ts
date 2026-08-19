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
};
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
    protected getNumber(key: string, defaultValue?: number): number;
    protected setNumber(key: string, value: number): void;
    protected getDate(key: string): Date;
    protected setDate(key: string, value: Date): void;
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
    get lastUpdateCheck(): Date;
    set lastUpdateCheck(d: Date);
    get theme(): ConfigTheme;
    set theme(theme: ConfigTheme);
    get windowWidth(): number;
    set windowWidth(windowWidth: number);
    get windowHeight(): number;
    set windowHeight(windowHeight: number);
    get windowX(): number;
    set windowX(windowX: number);
    get windowY(): number;
    set windowY(windowY: number);
    /**
     * @returns if a sufficient cool down has occured after last update check
     */
    isUpdateCheckNeeded(cooldownHours?: number): boolean;
    toJSON(): ConfigData;
}
//# sourceMappingURL=Config.d.ts.map