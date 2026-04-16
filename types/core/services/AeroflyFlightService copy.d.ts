import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import {
    AeroflyFlight,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteOrigin,
    AeroflySettingsCloud,
    AeroflySettingsFlight,
    AeroflySettingsAircraft,
    AeroflySettingsFuelLoad,
    AeroflyTimeUtc,
    AeroflyNavigationConfig,
} from "@fboes/aerofly-custom-missions";
import { Config } from "../io/Config.js";
import { AeroflyMainConfigReader } from "../io/AeroflyMainConfigReader.js";
import { AeroflyAircraftService } from "./AeroflyAircraftService.js";
import { AeroflyAirportService } from "./AeroflyAirportService.js";
/**
 * @property {number} base_feet_agl - The base altitude of the cloud layer in feet above ground level.
 * @property {number} cloud_coverage - The cloud coverage as a value between 0 and 1, where 0 means no clouds and 1 means completely overcast.
 */
export type AeroflyFlightServiceCloud = {
    base_feet_agl: number;
    cloud_coverage: number;
};
export type AeroflyFlightServiceAirport = {
    identifier: string;
    longitude: number;
    latitude: number;
    elevation_ft?: number;
};
export type AeroflyFlightServiceRunway = {
    identifier: string;
    length?: number;
    elevation_ft?: number;
};
export type AeroflyFlightServiceWaypoint = {
    identifier: string;
    longitude: number;
    latitude: number;
    altitude_ft?: number;
    flyOver?: boolean;
};
/**
 * AeroflyFlightService class that manages the state of the application and provides
 * methods to interact with the Aerofly DTO data.
 */
export declare class AeroflyFlightService {
    readonly config: Config;
    protected currentAircraft?: AeroflyAircraft;
    protected currentLivery?: AeroflyAircraftLivery;
    protected aeroflyFlight: AeroflyFlight;
    protected readonly aeroflyMainConfigReader: AeroflyMainConfigReader;
    readonly aircraftService: AeroflyAircraftService;
    readonly airportService: AeroflyAirportService;
    constructor(config: Config);
    readMainMcf(): void;
    getAeroflyFlight(): AeroflyFlight;
    setAircraft(aeroflyCodeAircraft: string, aeroflyCodeLivery: string): AeroflySettingsAircraft;
    getAircraft(): string;
    getLivery(): string;
    getAircraftData(): AeroflyAircraft | undefined;
    setFuelAndPayload(fuel: number, payload: number): AeroflySettingsFuelLoad;
    setFuel(fuel: number): void;
    getFuel(): number;
    getPayload(): number;
    getMaxPayload(): number;
    /**
     *
     * @returns returns the remaining payload after fuel has been set, disregarding currently loaded payload. This is useful to calculate the maximum payload that can be loaded based on the fuel weight.
     */
    getMaxRemainingPayload(): number;
    getMaxFuel(): number;
    getFlightplanDepartureAirport(): AeroflyNavRouteOrigin | undefined;
    getFlightplanDepartureRunway(): AeroflyNavRouteDepartureRunway | undefined;
    getFlightplanDepartureAirportString(): string;
    getFlightplanArrivalAirportString(): string;
    setFlightPosition(
        longitude: number,
        latitude: number,
        altitude_meter: number,
        heading_degree: number,
        speed_kts: number,
    ): AeroflySettingsFlight;
    setFlightPositionToDeparture(): void;
    importFlightplanFromSimBrief(simBriefUserName: string, getWeatherFromDestination?: boolean): Promise<void>;
    setFlightplan(
        origin: AeroflyFlightServiceAirport,
        destination: AeroflyFlightServiceAirport,
        {
            departureRunway,
            destinationRunway,
            waypoints,
            cruiseAltitudeFt,
        }?: {
            departureRunway?: AeroflyFlightServiceRunway;
            destinationRunway?: AeroflyFlightServiceRunway;
            waypoints?: AeroflyFlightServiceWaypoint[];
            cruiseAltitudeFt?: number;
        },
    ): AeroflyNavigationConfig;
    exportFlightplanToFile(filePath: string): Promise<void>;
    getImportFiles(): string[] | null;
    getImportableFlightplans(filePath: string): string[];
    importFlightplanFromFile(filePath: string, index?: number): void;
    setTimeAndDate(timeDate: string): AeroflyTimeUtc;
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
    setWeatherFromMETAR(metar: string): void;
    setWeatherViaApi(airportCode: string): Promise<object>;
    setWeather(
        visibilityM: number,
        temperatureCelsius: number,
        directionDegrees: number,
        speedKts: number,
        gustsKts?: number,
    ): object;
    getWeather(): object;
    setWind(directionDegrees: number, speedKts: number, gustsKts?: number): void;
    getWindDirection(): number;
    getWindSpeed(): number;
    getWindGusts(): number;
    setVisibilitySM(visibilitySM: number): void;
    setVisibilityM(visibilityM: number): void;
    getVisibilitySM(): number;
    getVisibilityM(): number;
    setTemperature(temperatureCelsius: number): void;
    getTemperature(): number;
    setClouds(clouds: AeroflyFlightServiceCloud[]): AeroflySettingsCloud[];
    getClouds(): AeroflyFlightServiceCloud[];
    writeFile(): void;
}
//# sourceMappingURL=AeroflyFlightService%20copy.d.ts.map
