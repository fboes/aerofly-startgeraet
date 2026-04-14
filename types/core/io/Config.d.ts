/**
 * Main application configuration. Includes configuration properties
 * as well as persistence handler.
 */
export declare class Config {
    private conf;
    constructor(projectName?: string);
    protected get(key: string, defaultValue?: string): string;
    protected set(key: string, value: string | number): void;
    protected getBoolean(key: string): boolean;
    protected setBoolean(key: string, value: boolean): void;
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
    get simBriefWeatherFromDestination(): boolean;
    set simBriefWeatherFromDestination(simBriefWeatherFromDestination: boolean);
    get importDirectory(): string;
    set importDirectory(importDirectory: string);
    get exportDirectory(): string;
    set exportDirectory(exportDirectory: string);
    get syncTimeOnStartup(): boolean;
    set syncTimeOnStartup(syncTimeOnStartup: boolean);
    toJSON(): {
        mainMcfFilePath: string | null;
        simBriefUserName: string;
        simBriefWeatherFromDestination: boolean;
        importDirectory: string;
        exportDirectory: string;
        syncTimeOnStartup: boolean;
    };
}
//# sourceMappingURL=Config.d.ts.map
