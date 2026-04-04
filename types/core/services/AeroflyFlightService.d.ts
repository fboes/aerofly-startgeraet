import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import { AeroflyFlight, AeroflyNavRouteDepartureRunway, AeroflyNavRouteOrigin } from "@fboes/aerofly-custom-missions";
import { Config } from "../io/Config.js";
import { AeroflyMainConfigReader } from "../io/AeroflyMainConfigReader.js";
/**
 * @property {number} base_feet_agl - The base altitude of the cloud layer in feet above ground level.
 * @property {number} cloud_coverage - The cloud coverage as a value between 0 and 1, where 0 means no clouds and 1 means completely overcast.
 */
export type AeroflyFlightServiceCloud = {
    base_feet_agl: number;
    cloud_coverage: number;
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
    constructor(config: Config);
    protected readMainMcf(): AeroflyFlight;
    getAeroflyFlight(): AeroflyFlight;
    setAircraft(aeroflyCodeAircraft: string, aeroflyCodeLivery: string): void;
    getAircraft(): string;
    getLivery(): string;
    setFuelAndPayload(fuel: number, payload: number): void;
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
    setFlightPositionToDeparture(): void;
    importFlightplanFromSimBrief(simBriefUserName: string, getWeatherFromDestination?: boolean): Promise<void>;
    exportFlightplanToFile(filePath: string): Promise<void>;
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
    setWeatherFromMETAR(metar: string): void;
    setWeatherViaApi(airportCode: string): Promise<void>;
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
    setClouds(clouds: AeroflyFlightServiceCloud[]): void;
    getClouds(): AeroflyFlightServiceCloud[];
    writeFile(): void;
}
//# sourceMappingURL=AeroflyFlightService.d.ts.map