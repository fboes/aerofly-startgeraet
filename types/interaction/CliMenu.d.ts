import { Controller, ControllerCloud } from "../controller/Controller.js";
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
  protected writeln(message: string): void;
  protected writeSuccess(message: string): void;
  protected writeError(message: string): void;
  protected getMainMenuChoice(): {
    name: string;
    value: CliMenuMethod;
  };
}
//# sourceMappingURL=CliMenu.d.ts.map
