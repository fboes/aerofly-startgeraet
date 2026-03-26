/**
 * Main application configuration. Includes configuration properties
 * as well as persistence handler.
 */
export declare class Config {
  private conf;
  constructor(projectName?: string);
  private get;
  private set;
  private getBoolean;
  private setBoolean;
  /**
   * @returns The file path to the main.mcf file of Aerofly FS 4, which contains the flight plan. This is needed to import flight plans from SimBrief into Aerofly FS 4.
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
}
//# sourceMappingURL=Config.d.ts.map
