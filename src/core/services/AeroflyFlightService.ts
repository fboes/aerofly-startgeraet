import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import {
    AeroflyFlight,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteOrigin,
    AeroflySettingsCloud,
    AeroflySettingsFlight,
} from "@fboes/aerofly-custom-missions";
import { SimBriefAeroflyApi } from "../api/SimBriefAeroflyApi.js";
import { AviationWeatherApiAerofly } from "../api/AviationWeatherAeroflyApi.js";
import { Config } from "../io/Config.js";
import { AeroflyMainConfigReader } from "../io/AeroflyMainConfigReader.js";
import { ImportFileFinderService } from "./ImportFileFinderService.js";
import { ImportFileReader } from "../io/ImportFileReader.js";
import { ExportFileWriter } from "../io/ExportFileWriter.js";
import { AeroflyAircraftService } from "./AeroflyAircraftService.js";
import { AeroflyFlightFormatter } from "../formatter/AeroflyFlightFormatter.js";
import { AeroflyFlightHelper } from "../util/AeroflyFlightHelper.js";
import { ImportMetarConverter } from "../converter/ImportMetarConverter.js";

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
export class AeroflyFlightService {
    protected currentAircraft?: AeroflyAircraft;
    protected currentLivery?: AeroflyAircraftLivery;
    protected aeroflyFlight: AeroflyFlight;
    protected readonly aeroflyMainConfigReader: AeroflyMainConfigReader;

    constructor(public readonly config: Config) {
        this.aeroflyMainConfigReader = new AeroflyMainConfigReader(this.config);
        this.aeroflyFlight = this.readMainMcf();
        this.setAircraft(this.aeroflyFlight.aircraft.name, this.aeroflyFlight.aircraft.paintscheme);
        if (this.config.syncTimeOnStartup) {
            this.aeroflyFlight.timeUtc.time = new Date();
        }
    }

    // ----------------------------------------------------------

    protected readMainMcf(): AeroflyFlight {
        return this.aeroflyMainConfigReader.read();
    }

    // ----------------------------------------------------------

    getAeroflyFlight(): AeroflyFlight {
        return this.aeroflyFlight;
    }

    setAircraft(aeroflyCodeAircraft: string, aeroflyCodeLivery: string): void {
        this.currentAircraft = AeroflyAircraftService.getAircraft(aeroflyCodeAircraft);
        this.currentLivery = AeroflyAircraftService.getLiveryForAircraft(this.currentAircraft, aeroflyCodeLivery);
        this.aeroflyFlight.setAircraftName(aeroflyCodeAircraft);
        this.aeroflyFlight.aircraft.paintscheme = aeroflyCodeLivery;
    }

    getAircraft(): string {
        return this.aeroflyFlight.aircraft.name;
    }

    getLivery(): string {
        return this.aeroflyFlight.aircraft.paintscheme;
    }

    // ----------------------------------------------------------

    setFuelAndPayload(fuel: number, payload: number): void {
        fuel = Math.max(0, Math.min(fuel, this.getMaxFuel()));
        payload = Math.max(0, Math.min(payload, this.getMaxPayload()));

        this.aeroflyFlight.fuelLoadSetting.fuelMass = fuel;
        this.aeroflyFlight.fuelLoadSetting.payloadMass = payload;
        this.aeroflyFlight.fuelLoadSetting.configuration = fuel > 0 ? "Keep" : "Invalid";
    }

    setFuel(fuel: number): void {
        this.setFuelAndPayload(fuel, this.getPayload());
    }

    getFuel(): number {
        return this.aeroflyFlight.fuelLoadSetting.fuelMass;
    }

    getPayload(): number {
        return this.aeroflyFlight.fuelLoadSetting.payloadMass;
    }

    getMaxPayload(): number {
        return this.currentAircraft
            ? (this.currentAircraft.maximumPayloadKg ??
                  (this.currentAircraft.maximumTakeoffMassKg ?? 0) - (this.currentAircraft.operatingEmptyMassKg ?? 0))
            : 0;
    }

    /**
     *
     * @returns returns the remaining payload after fuel has been set, disregarding currently loaded payload. This is useful to calculate the maximum payload that can be loaded based on the fuel weight.
     */
    getMaxRemainingPayload(): number {
        if (!this.currentAircraft) {
            return 0;
        }

        return (
            (this.currentAircraft.maximumTakeoffMassKg ?? 0) -
            (this.currentAircraft.operatingEmptyMassKg ?? 0) -
            this.getFuel()
        );
    }

    getMaxFuel(): number {
        return this.currentAircraft ? (this.currentAircraft.maximumFuelMassKg ?? 0) : 0;
    }

    // ----------------------------------------------------------

    getFlightplanDepartureAirport(): AeroflyNavRouteOrigin | undefined {
        return this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteOrigin);
    }

    getFlightplanDepartureRunway(): AeroflyNavRouteDepartureRunway | undefined {
        return this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteDepartureRunway);
    }

    getFlightplanDepartureAirportString(): string {
        return this.getFlightplanDepartureAirport()?.identifier ?? "";
    }

    getFlightplanArrivalAirportString(): string {
        return (
            this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteDestination)
                ?.identifier ?? ""
        );
    }

    setFlightPositionToDeparture() {
        const departureAirport = this.getFlightplanDepartureAirport();
        if (!departureAirport) {
            return;
        }

        const departureRunway = this.getFlightplanDepartureRunway();
        const runwayDirection = departureRunway?.direction_degree ?? 0;

        this.aeroflyFlight.flightSetting = new AeroflySettingsFlight(
            departureAirport.longitude,
            departureAirport.latitude,
            departureAirport.elevation ?? 0,
            0,
            runwayDirection,
            {
                airport: departureAirport.identifier,
            },
        );
    }

    // ----------------------------------------------------------

    async importFlightplanFromSimBrief(simBriefUserName: string, getWeatherFromDestination: boolean = false) {
        try {
            const simbrief = new SimBriefAeroflyApi();
            await simbrief.fetchMission(simBriefUserName, this.aeroflyFlight, getWeatherFromDestination);
        } catch (error) {
            if (error instanceof Error && error.message.includes("Unknown UserID")) {
                this.config.simBriefUserName = "";
            }
            throw error instanceof Error ? error : new Error("An unknown error occurred while fetching SimBrief data");
        }
        this.currentAircraft = AeroflyAircraftService.getAircraft(this.aeroflyFlight.aircraft.name);
        this.currentLivery = AeroflyAircraftService.getLiveryForAircraft(
            this.currentAircraft,
            this.aeroflyFlight.aircraft.paintscheme,
        );
    }

    async exportFlightplanToFile(filePath: string): Promise<void> {
        ExportFileWriter.exportFlightplanToFile(filePath, this.aeroflyFlight);
    }

    getImportFiles(): string[] | null {
        const importFileFinder = new ImportFileFinderService(this.config);
        return importFileFinder.findImportFiles();
    }

    getImportableFlightplans(filePath: string): string[] {
        return ImportFileReader.getFlightplans(filePath);
    }

    importFlightplanFromFile(filePath: string, index = 0): void {
        ImportFileReader.importFile(filePath, this.aeroflyFlight, index);
        this.setFlightPositionToDeparture();
    }

    // ----------------------------------------------------------

    setTimeAndDate(timeDate: string): void {
        this.aeroflyFlight.timeUtc.time = new Date(timeDate);
    }

    getTimeAndDate(): Date {
        return this.aeroflyFlight.timeUtc.time;
    }

    getTimeAndDateDeparture() {
        return AeroflyFlightHelper.getTimeAndDateDeparture(this.aeroflyFlight);
    }

    getTimeAndDateString(): string {
        return `${AeroflyFlightFormatter.dateToString(this.aeroflyFlight.timeUtc.time)} UTC`;
    }

    getTimeAndDateDepartureString(): string {
        const localTime = this.getTimeAndDateDeparture();
        return `${AeroflyFlightFormatter.dateToString(localTime)} ${this.getDepartureTimeZoneUTCString()}`;
    }

    getTimeAndDateCombinedString(): string {
        return `${this.getTimeAndDateString()} | ${this.getTimeAndDateDepartureString()} (${AeroflyFlightFormatter.getSunPositionName(this.aeroflyFlight)})`;
    }

    /**
     * @returns e.g. "Z" or "+02:00" nautical time zone offset based on the coordinates of the departure airport
     */
    getDepartureTimeZoneString(): string {
        const timeZone = AeroflyFlightHelper.getDepartureTimeZone(this.aeroflyFlight);
        if (timeZone === 0) {
            return "Z";
        }

        return `${timeZone >= 0 ? "+" : "-"}${Math.abs(timeZone).toString().padStart(2, "0")}:00`;
    }

    /**
     * @returns e.g. "UTC" or "UTC+2" nautical time zone offset based on the coordinates of the departure airport
     */
    getDepartureTimeZoneUTCString(): string {
        const timeZone = AeroflyFlightHelper.getDepartureTimeZone(this.aeroflyFlight);

        return `UTC${timeZone >= 0 ? "+" : "-"}${Math.abs(Math.round(timeZone))}`;
    }

    // ----------------------------------------------------------

    setWeatherFromMETAR(metar: string): void {
        const converter = new ImportMetarConverter();
        converter.convert(metar, this.aeroflyFlight);
    }

    async setWeatherViaApi(airportCode: string): Promise<void> {
        await AviationWeatherApiAerofly.fetchMetarToFlight(airportCode, this.aeroflyFlight);
    }

    // ----------------------------------------------------------

    setWind(directionDegrees: number, speedKts: number, gustsKts?: number): void {
        this.aeroflyFlight.wind.directionInDegree = directionDegrees;
        this.aeroflyFlight.wind.speed_kts = speedKts;
        this.aeroflyFlight.wind.gust_kts = gustsKts ?? 0;
    }

    getWindDirection(): number {
        return this.aeroflyFlight.wind.directionInDegree;
    }

    getWindSpeed(): number {
        return this.aeroflyFlight.wind.speed_kts;
    }

    getWindGusts(): number {
        return this.aeroflyFlight.wind.gust_kts;
    }

    // ----------------------------------------------------------

    setVisibilitySM(visibilitySM: number): void {
        this.aeroflyFlight.visibility_sm = visibilitySM;
    }

    setVisibilityM(visibilityM: number): void {
        this.aeroflyFlight.visibility_meter = visibilityM;
    }

    getVisibilitySM(): number {
        return this.aeroflyFlight.visibility_sm;
    }

    getVisibilityM(): number {
        return this.aeroflyFlight.visibility_meter;
    }

    // ----------------------------------------------------------

    setTemperature(temperatureCelsius: number): void {
        this.aeroflyFlight.wind.temperature_celsius = temperatureCelsius;
    }

    getTemperature(): number {
        return this.aeroflyFlight.wind.temperature_celsius;
    }

    // ----------------------------------------------------------

    setClouds(clouds: AeroflyFlightServiceCloud[]): void {
        this.aeroflyFlight.clouds = []; // Clear existing clouds
        this.aeroflyFlight.clouds = clouds
            .filter((cloud) => cloud.cloud_coverage > 0)
            .map((cloud) => AeroflySettingsCloud.createInFeet(cloud.cloud_coverage, cloud.base_feet_agl));
    }

    getClouds(): AeroflyFlightServiceCloud[] {
        return this.aeroflyFlight.clouds.map((cloud): AeroflyFlightServiceCloud => {
            return {
                base_feet_agl: cloud.height_ft,
                cloud_coverage: cloud.density,
            };
        });
    }

    // ----------------------------------------------------------

    writeFile(): void {
        this.aeroflyMainConfigReader.write(this.aeroflyFlight);
    }
}
