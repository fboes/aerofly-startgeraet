import Conf from "conf";
import os from "node:os";
import path from "node:path";
import fs from "fs";

export class Config {
  private conf: Conf;

  constructor(projectName: string = "startgeraet") {
    this.conf = new Conf({ projectName });
  }

  private get(key: string, defaultValue: string = ""): string {
    return String(this.conf.get(key, defaultValue));
  }

  private set(key: string, value: string | number): void {
    this.conf.set(key, value);
  }

  private getBoolean(key: string): boolean {
    return Boolean(this.conf.get(key, false));
  }

  private setBoolean(key: string, value: boolean): void {
    this.conf.set(key, value);
  }

  // ----------------------------------------------------------

  /**
   * @returns The file path to the main.mcf file of Aerofly FS 4, which contains the flight plan. This is needed to import flight plans from SimBrief into Aerofly FS 4.
   */
  get mainMcfFilePath(): string | null {
    return this.get("mainMcfFilePath", "") || this.findMainMcfFilePath();
  }

  set mainMcfFilePath(mainMcfFilePath: string) {
    this.set("mainMcfFilePath", mainMcfFilePath);
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
    return this.get("simBriefUserName", "");
  }

  set simBriefUserName(simBriefUserName: string) {
    this.set("simBriefUserName", simBriefUserName);
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
    this.set("importDirectory", importDirectory);
  }

  get syncTimeOnStartup(): boolean {
    return this.getBoolean("syncTimeOnStartup");
  }

  set syncTimeOnStartup(syncTimeOnStartup: boolean) {
    this.setBoolean("syncTimeOnStartup", syncTimeOnStartup);
  }
}
