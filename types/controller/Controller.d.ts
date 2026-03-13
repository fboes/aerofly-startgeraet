import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import { AeroflyFlight, AeroflyNavRouteDepartureRunway, AeroflyNavRouteOrigin } from "@fboes/aerofly-custom-missions";
import { Config } from "../model/Config.js";
import { MainConfigReader } from "../model/MainConfigReader.js";
/**
 * @property {number} base_feet_agl - The base altitude of the cloud layer in feet above ground level.
 * @property {number} cloud_coverage - The cloud coverage as a value between 0 and 1, where 0 means no clouds and 1 means completely overcast.
 */
export type ControllerCloud = {
    base_feet_agl: number;
    cloud_coverage: number;
};
/**
 * Controller class that manages the state of the application and provides
 * methods to interact with the Aerofly DTO data.
 */
export declare class Controller {
    conf: Config;
    protected aeroflyAircraftDatabase: AeroflyAircraft[];
    protected currentAircraft?: AeroflyAircraft;
    protected currentLivery?: AeroflyAircraftLivery;
    protected aeroflyFlight: AeroflyFlight;
    protected mainConfigReader: MainConfigReader;
    constructor(conf: Config);
    getMainMcfFilePath(): string | null;
    setMainMcfFilePath(mainMcfFilePath: string): void;
    readMainMcf(): AeroflyFlight;
    getAircraftLiveriesData(aeroflyCodeAircraft: string): AeroflyAircraftLivery[];
    getCurrentAircraftData(aeroflyCodeAircraft: string): AeroflyAircraft | undefined;
    getAllAircraftData(): AeroflyAircraft[];
    setAircraft(aeroflyCodeAircraft: string, aeroflyCodeLivery: string): void;
    getAircraft(): string;
    getLivery(): string;
    getAircraftString(): string;
    setFuelAndPayload(fuel: number, payload: number): void;
    setFuel(fuel: number): void;
    getFuel(): number;
    getPayload(): number;
    getFuelAndPayloadString(): string;
    getMaxPayload(): number;
    /**
     *
     * @returns returns the remaining payload after fuel has been set, disregarding currently loaded payload. This is useful to calculate the maximum payload that can be loaded based on the fuel weight.
     */
    getMaxRemainingPayload(): number;
    getMaxFuel(): number;
    getFlightplanString(): string;
    getFlightplanWaypointsString(): string;
    /**
     * @returns in meters
     */
    getFlightplanDistance(): number;
    getFlightplanDistanceString(): string;
    getFlightplanDepartureAirport(): AeroflyNavRouteOrigin | undefined;
    getFLightplanDepartureRunway(): AeroflyNavRouteDepartureRunway | undefined;
    getFlightplanDepartureAirportString(): string;
    getFlightplanArrivalAirportString(): string;
    setFlightPositionToDeparture(): void;
    setSimBriefUserName(simBriefUserName: string): void;
    getSimBriefUserName(): string;
    importFlightplanFromSimBrief(simBriefUserName: string): Promise<void>;
    setImportDirectory(importDirectory: string): void;
    getImportDirectory(): string;
    getImportFiles(): string[] | null;
    importFlightplanFromFile(filePath: string): void;
    setTimeAndDate(timeDate: string): void;
    getTimeAndDate(): Date;
    getTimeAndDateDeparture(): Date;
    getTimeAndDateString(): string;
    getTimeAndDateDepartureString(): string;
    getTimeAndDateCombinedString(): string;
    /**
     * @returns e.g. "Z" or "+02:00" nautical time zone offset based on the coordinates of the departure airport
     */
    getDepartureTimeZoneString(): string;
    /**
     * @returns e.g. "UTC" or "UTC+2" nautical time zone offset based on the coordinates of the departure airport
     */
    getDepartureTimeZoneUTCString(): string;
    /**
     * @returns nautical time zone offset based on the coordinates of the departure airport
     */
    getDepartureTimeZone(): number;
    setWeatherFromMETAR(airportCode: string): Promise<void>;
    setWind(directionDegrees: number, speedKts: number, gustsKts?: number): void;
    getWindDirection(): number;
    getWindSpeed(): number;
    getWindGusts(): number;
    getWindString(): string;
    setVisibilitySM(visibilitySM: number): void;
    setVisibilityM(visibilityM: number): void;
    getVisibilitySM(): number;
    getVisibilityM(): number;
    getVisibilityString(): string;
    setTemperature(temperatureCelsius: number): void;
    getTemperature(): number;
    getTemperatureString(): string;
    setClouds(clouds: ControllerCloud[]): void;
    getClouds(): ControllerCloud[];
    getCloudsString(): string;
    writeFile(): void;
    numberToString(num: number): string;
    dateToString(date: Date): string;
}
//# sourceMappingURL=Controller.d.ts.map