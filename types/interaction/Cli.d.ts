import { Controller, ControllerCloud } from "../controller/Controller.js";
import { Config } from "../model/Config.js";
export type CliMenuMethod = Exclude<keyof CliMenu, "controller" | "showMenuTitle" | "name">;
/**
 * Providing menu options to set up the flight in a more convenient way.
 * The menu will then generate a configuration file that can be loaded in
 * Aerofly FS 4.
 */
export declare class CliMenu {
  controller: Controller;
  constructor(controller: Controller);
  mainMenu(): Promise<CliMenuMethod>;
  selectAircraft(): Promise<CliMenuMethod>;
  setFuelAndPayload(): Promise<CliMenuMethod>;
  importFlightplan(): Promise<CliMenuMethod>;
  setTimeAndDate(): Promise<CliMenuMethod>;
  protected setTimeAndDateManual(timeZoneUTCName: string, timeZoneName: string, timeValue: Date): Promise<string>;
  importWeather(): Promise<CliMenuMethod>;
  setWind(): Promise<CliMenuMethod>;
  setTemperature(): Promise<CliMenuMethod>;
  setVisibility(): Promise<CliMenuMethod>;
  setClouds(): Promise<CliMenuMethod>;
  protected setCloud(index?: number, cloud?: ControllerCloud): Promise<ControllerCloud>;
  setConfiguration(): Promise<CliMenuMethod>;
  saveAndExit(): CliMenuMethod;
  exit(): null;
  protected showMenuTitle(titles?: string[]): void;
  protected name(option: string, value: string, sub?: boolean): string;
  protected getMainMenuChoice(): {
    name: string;
    value: CliMenuMethod;
  };
}
export declare class CliSetup {
  protected config: Config;
  constructor(config: Config);
  setup(): Promise<void>;
}
/**
 * Helper class to write styled messages to the console.
 */
export declare class Cli {
  static writeln(message: string): void;
  static writeSuccess(message: string): void;
  static writeError(message: string): void;
  static writeCatch(error: unknown): void;
}
//# sourceMappingURL=Cli.d.ts.map
