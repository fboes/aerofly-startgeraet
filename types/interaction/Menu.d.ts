export type MenuMethod = Exclude<keyof Menu, "aircraftLiveries" | "showMenuTitle" | "name">;
/**
 * Providing menu options to set up the flight in a more convenient way.
 * The menu will then generate a configuration file that can be loaded in
 * Aerofly FS 4.
 */
export declare class Menu {
  aircraftLiveries: {
    name: string;
    nameFull: string;
    icaoCode: string;
    tags: string[];
    approachAirspeedKts: number;
    cruiseAltitudeFt: number;
    cruiseSpeedKts: number;
    maximumRangeNm: number;
    aeroflyCode: string;
    liveries: import("@fboes/aerofly-data/data/aircraft-liveries.json").AeroflyAircraftLivery[];
  }[];
  mainMenu(): Promise<MenuMethod>;
  selectAircraft(): Promise<MenuMethod>;
  setFuelAndPayload(): Promise<MenuMethod>;
  importFlightplan(): Promise<MenuMethod>;
  setTimeAndDate(): Promise<MenuMethod>;
  protected setTimeAndDateManual(name: string): Promise<string>;
  importWeather(): Promise<MenuMethod>;
  setWind(): Promise<MenuMethod>;
  setTemperature(): Promise<MenuMethod>;
  setClouds(): Promise<MenuMethod>;
  protected setCloud(index?: number): Promise<{
    base_feet_agl: number;
    cloud_coverage: number;
  }>;
  setVisibility(): Promise<MenuMethod>;
  help(): Promise<MenuMethod>;
  exit(): null;
  protected showMenuTitle(titles?: string[]): void;
  protected name(option: string, value: string, sub?: boolean): string;
  protected writeln(message: string): void;
  protected getMainMenuChoice(): {
    name: string;
    value: MenuMethod;
  };
}
//# sourceMappingURL=Menu.d.ts.map
