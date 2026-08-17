import type { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import { type AeroflyFlight, AeroflyNavRouteDepartureRunway, AeroflyNavRouteOrigin, AeroflySettingsCloud, AeroflySettingsFlight, type AeroflySettingsAircraft, type AeroflySettingsFuelLoad, type AeroflyTimeUtc, type AeroflyNavigationConfig } from "@fboes/aerofly-custom-missions";
import type { Config } from "../io/Config.js";
import { type RoutePlanServiceLeg, type RoutePlanServiceRoute } from "./RoutePlanService.js";
import type { AeroflylightCategoryUs, AeroflylightCategoryIcao } from "../util/AeroflyFlightHelper.js";
import type { AeroflySettingsFlightConfiguration } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflySettingsFlight.js";
import { type GithubReleaseApiPayload } from "./UpdateCheckService.js";
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
    direction_degree?: number;
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
    private currentAircraft?;
    private aeroflyFlight;
    private readonly aeroflyMainConfigReader;
    constructor(config: Config);
    readMainMcf(): void;
    getAeroflyFlight(): AeroflyFlight;
    setAircraft(aeroflyCodeAircraft: string, aeroflyCodeLivery: string): AeroflySettingsAircraft;
    private updateCurrentAircraft;
    getAircraft(): string;
    getLivery(): string;
    getAircraftData(): AeroflyAircraft | undefined;
    /**
     *
     * @param fuel kg
     * @param payload kg
     * @returns fuel load setting
     */
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
    getFlightplanLegs(trueAirspeed_kts?: number, consolidated?: boolean): RoutePlanServiceLeg[] | RoutePlanServiceRoute;
    /**
     * Will set the position of the aircraft, using some defaults.
     * @param longitude WGS84
     * @param latitude WHS84
     * @param altitude_meter must be set, even if aircraft is on ground
     * @param heading_degree
     * @param speed_kts if set to `undefined`, will be set to cruise speed
     * @param configuration if set to `undefined`, will be set to `Cruise`, or to `OnGround` if speed_kts is `0`. Configuration will set throttle, flaps and gear.
     * @returns evaluated flight settings
     */
    setFlightPosition(longitude: number, latitude: number, altitude_meter: number, heading_degree: number, speed_kts?: number | undefined, configuration?: AeroflySettingsFlightConfiguration | undefined): AeroflySettingsFlight;
    setFlightPositionToDeparture(): void;
    setCruise(cruiseAltitudeFt: number, cruiseSpeedKts: number): AeroflyNavigationConfig;
    /**
     *
     * @param simBriefUserName
     * @param getWeatherFromDestination 0 for origin, 1 for destination, -1 for none at all
     */
    importFlightplanFromSimBrief(simBriefUserName: string, getWeatherFromDestination?: number): Promise<void>;
    setFlightplan(origin: AeroflyFlightServiceAirport, destination: AeroflyFlightServiceAirport, { departureRunway, destinationRunway, waypoints, cruiseAltitudeFt, }?: {
        departureRunway?: AeroflyFlightServiceRunway;
        destinationRunway?: AeroflyFlightServiceRunway;
        waypoints?: AeroflyFlightServiceWaypoint[];
        cruiseAltitudeFt?: number;
    }): AeroflyNavigationConfig;
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
    /**
     * Modify weather by calling METAR / TAF API.
     * TAFs will be called if date is set in the future.
     * @param airportCode ICAO code
     * @returns modified weather settings
     */
    setWeatherViaApi(airportCode: string): Promise<object>;
    setWeather(visibilityM: number, temperatureCelsius: number, directionDegrees: number, speedKts: number, gustsKts?: number): object;
    setWeatherViaFlightCategory(category: AeroflylightCategoryUs): void;
    setWeatherViaFlightCategoryIcao(category: AeroflylightCategoryIcao): void;
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
    /**
     * Will only be executed if last update check had a sufficient cool down
     * @returns null if no update is needs, GithubReleaseApiPayload if an update is available
     */
    getUpdateInformation(force?: boolean): Promise<GithubReleaseApiPayload | null>;
    writeFile(): void;
}
//# sourceMappingURL=AeroflyFlightService.d.ts.map