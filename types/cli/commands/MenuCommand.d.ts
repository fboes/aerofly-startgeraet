import { AeroflyFlightServiceCloud } from "../../core/services/AeroflyFlightService.js";
import { ControllerCommand } from "./Command.js";
export type MenuCommandMethod = Exclude<keyof MenuCommand, "controller" | "showMenuTitle" | "name" | "execute">;
/**
 * Providing menu options to set up the flight in a more convenient way.
 * The menu will then generate a configuration file that can be loaded in
 * Aerofly FS 4.
 */
export declare class MenuCommand extends ControllerCommand {
  execute(): Promise<number>;
  mainMenu(): Promise<MenuCommandMethod>;
  selectAircraft(): Promise<MenuCommandMethod>;
  setFuelAndPayload(): Promise<MenuCommandMethod>;
  importFlightplan(): Promise<MenuCommandMethod>;
  exportFlightplan(): Promise<MenuCommandMethod>;
  setTimeAndDate(): Promise<MenuCommandMethod>;
  protected setTimeAndDateManual(timeZoneUTCName: string, timeZoneName: string, timeValue: Date): Promise<string>;
  importWeather(): Promise<MenuCommandMethod>;
  setWind(): Promise<MenuCommandMethod>;
  setTemperature(): Promise<MenuCommandMethod>;
  setVisibility(): Promise<MenuCommandMethod>;
  setClouds(): Promise<MenuCommandMethod>;
  protected setCloud(index?: number, cloud?: AeroflyFlightServiceCloud): Promise<AeroflyFlightServiceCloud>;
  setConfiguration(): Promise<MenuCommandMethod>;
  saveAndExit(): MenuCommandMethod;
  exit(): null;
  protected name(option: string, value: string, sub?: boolean): string;
  protected getMainMenuChoice(): {
    name: string;
    value: MenuCommandMethod;
  };
}
//# sourceMappingURL=MenuCommand.d.ts.map
