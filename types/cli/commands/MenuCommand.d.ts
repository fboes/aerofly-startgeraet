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
    private setTimeAndDateManual;
    importWeather(): Promise<MenuCommandMethod>;
    setWind(): Promise<MenuCommandMethod>;
    setTemperature(): Promise<MenuCommandMethod>;
    setVisibility(): Promise<MenuCommandMethod>;
    setClouds(): Promise<MenuCommandMethod>;
    private setCloud;
    setConfiguration(): Promise<MenuCommandMethod>;
    saveAndExit(): MenuCommandMethod;
    exit(): null;
    private name;
    private getMainMenuChoice;
}
//# sourceMappingURL=MenuCommand.d.ts.map