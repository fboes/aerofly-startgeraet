import type { AeroflyAircraft } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import {
    type AeroflyFlight,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
    AeroflySettingsCloud,
    AeroflySettingsFlight,
    type AeroflySettingsAircraft,
    type AeroflySettingsFuelLoad,
    type AeroflyTimeUtc,
    type AeroflyNavigationConfig,
} from "@fboes/aerofly-custom-missions";
import { SimBriefAeroflyApi } from "../api/SimBriefAeroflyApi.js";
import { AviationWeatherApiAerofly } from "../api/AviationWeatherAeroflyApi.js";
import type { Config } from "../io/Config.js";
import { AeroflyMainConfigReader } from "../io/AeroflyMainConfigReader.js";
import { ImportFileFinderService } from "./ImportFileFinderService.js";
import * as ImportFileReader from "../io/importFlightplan.js";
import * as ExportFileWriter from "../io/exportFlightplan.js";
import * as AeroflyFlightFormatter from "../formatter/AeroflyFlightFormatter.js";
import * as AeroflyFlightHelper from "../util/AeroflyFlightHelper.js";
import { MetarToAeroflyFlightConverter } from "../converter/other/MetarToAeroflyFlightConverter.js";
import { AeroflyFlightFallback } from "../data/AeroflyFlightFallback.js";
import { RoutePlanService, type RoutePlanServiceLeg, type RoutePlanServiceRoute } from "./RoutePlanService.js";
import { getAeroflyAircraft } from "./getAeroflyAircraft.js";
import type { AeroflylightCategoryUs, AeroflylightCategoryIcao } from "../util/AeroflyFlightHelper.js";
import type { AeroflySettingsFlightConfiguration } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflySettingsFlight.js";
import { UpdateCheckService, type GithubReleaseApiPayload } from "./UpdateCheckService.js";
import { APPLICATION_INFORMATION } from "./getApplicationInformation.js";
import { getAeroflyAirportByIcaoCode } from "./getAeroflyAirport.js";

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
export class AeroflyFlightService {
    private currentAircraft?: AeroflyAircraft;
    private aeroflyFlight: AeroflyFlight;
    private readonly aeroflyMainConfigReader: AeroflyMainConfigReader;

    constructor(public readonly config: Config) {
        this.aeroflyMainConfigReader = new AeroflyMainConfigReader(this.config);
        this.aeroflyFlight = new AeroflyFlightFallback();
        this.setAircraft(this.aeroflyFlight.aircraft.name, this.aeroflyFlight.aircraft.paintscheme);
        if (this.config.syncTimeOnStartup) {
            this.aeroflyFlight.timeUtc.time = new Date();
        }
    }

    // ----------------------------------------------------------

    readMainMcf() {
        this.aeroflyFlight = this.aeroflyMainConfigReader.read();
        this.updateCurrentAircraft();
    }

    // ----------------------------------------------------------

    getAeroflyFlight(): AeroflyFlight {
        return this.aeroflyFlight;
    }

    setAircraft(aeroflyCodeAircraft: string, aeroflyCodeLivery: string): AeroflySettingsAircraft {
        this.aeroflyFlight.setAircraftName(aeroflyCodeAircraft);
        this.aeroflyFlight.aircraft.paintscheme = aeroflyCodeLivery;
        this.updateCurrentAircraft();
        return this.aeroflyFlight.aircraft;
    }

    private updateCurrentAircraft() {
        if (this.aeroflyFlight.aircraft.name === this.currentAircraft?.aeroflyCode) {
            return;
        }

        this.currentAircraft = getAeroflyAircraft(this.aeroflyFlight.aircraft.name);
        if (!this.currentAircraft) {
            return;
        }

        this.aeroflyFlight.navigation.cruiseAltitude_ft = this.currentAircraft.cruiseAltitudeFt;
        this.aeroflyFlight.navigation._cruiseSpeed_kts = this.currentAircraft.cruiseSpeedKts;
    }

    getAircraft(): string {
        return this.aeroflyFlight.aircraft.name;
    }

    getLivery(): string {
        return this.aeroflyFlight.aircraft.paintscheme;
    }

    getAircraftData(): AeroflyAircraft | undefined {
        return this.currentAircraft;
    }

    // ----------------------------------------------------------

    /**
     *
     * @param fuel kg
     * @param payload kg
     * @returns fuel load setting
     */
    setFuelAndPayload(fuel: number, payload: number): AeroflySettingsFuelLoad {
        fuel = Math.max(0, Math.min(fuel, this.getMaxFuel()));
        payload = Math.max(0, Math.min(payload, this.getMaxRemainingPayload()));

        this.aeroflyFlight.fuelLoadSetting.fuelMass = fuel;
        this.aeroflyFlight.fuelLoadSetting.payloadMass = payload;
        this.aeroflyFlight.fuelLoadSetting.configuration = "Keep";

        return this.aeroflyFlight.fuelLoadSetting;
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

    getFlightplanLegs(trueAirspeed_kts = 0, consolidated = false): RoutePlanServiceLeg[] | RoutePlanServiceRoute {
        if (trueAirspeed_kts === 0) {
            trueAirspeed_kts = this.currentAircraft?.cruiseSpeedKts ?? 0;
        }

        if (trueAirspeed_kts === 0) {
            throw new Error("Cruise speed must be bigger than 0");
        }

        const route = new RoutePlanService(this.aeroflyFlight);
        return !consolidated ? route.getRouteLegs(trueAirspeed_kts) : route.getRoute(trueAirspeed_kts);
    }

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
    setFlightPosition(
        longitude: number,
        latitude: number,
        altitude_meter: number,
        heading_degree: number,
        speed_kts: number | undefined = undefined,
        configuration: AeroflySettingsFlightConfiguration | undefined = undefined,
    ): AeroflySettingsFlight {
        if (speed_kts === undefined) {
            speed_kts =
                configuration === "OnGround" || !this.currentAircraft?.cruiseSpeedKts
                    ? 0
                    : this.currentAircraft?.cruiseSpeedKts;
        }
        configuration = configuration ?? (speed_kts > 0 ? "Cruise" : "OnGround");

        this.aeroflyFlight.flightSetting = new AeroflySettingsFlight(
            longitude,
            latitude,
            altitude_meter,
            heading_degree,
            speed_kts,
            {
                configuration,
                onGround: configuration === "OnGround",
            },
        );

        return this.aeroflyFlight.flightSetting;
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
            runwayDirection,
            0,
            {
                airport: departureAirport.identifier,
                runway: departureRunway?.identifier,
                configuration: "OnGround",
                onGround: true,
            },
        );
    }

    setCruise(cruiseAltitudeFt: number, cruiseSpeedKts: number): AeroflyNavigationConfig {
        this.aeroflyFlight.navigation.cruiseAltitude_ft = cruiseAltitudeFt;
        this.aeroflyFlight.navigation._cruiseSpeed_kts = cruiseSpeedKts;
        return this.aeroflyFlight.navigation;
    }

    // ----------------------------------------------------------

    /**
     *
     * @param simBriefUserName
     * @param getWeatherFromDestination 0 for origin, 1 for destination, -1 for none at all
     */
    async importFlightplanFromSimBrief(simBriefUserName: string, getWeatherFromDestination: number = 0) {
        try {
            const simbrief = new SimBriefAeroflyApi();
            await simbrief.fetchMission(simBriefUserName, this.aeroflyFlight, getWeatherFromDestination);
        } catch (error) {
            if (error instanceof Error && error.message.includes("Unknown UserID")) {
                this.config.simBriefUserName = "";
            }
            throw error instanceof Error ? error : new Error("An unknown error occurred while fetching SimBrief data");
        }
        this.updateCurrentAircraft();
    }

    setQuickFlightplan(origin: string, destination: string) {
        const originData = getAeroflyAirportByIcaoCode(origin);
        if (!originData) {
            throw new Error(`Could not find origin airport with ICAO cdoe "${origin}"`);
        }
        const destinationData = getAeroflyAirportByIcaoCode(destination);
        if (!destinationData) {
            throw new Error(`Could not find destination airport with ICAO cdoe "${origin}"`);
        }

        this.setFlightplan(
            {
                identifier: originData.code,
                longitude: originData.lon,
                latitude: originData.lat,
            },
            {
                identifier: destinationData.code,
                longitude: destinationData.lon,
                latitude: destinationData.lat,
            },
        );
    }

    setFlightplan(
        origin: AeroflyFlightServiceAirport,
        destination: AeroflyFlightServiceAirport,
        {
            departureRunway,
            destinationRunway,
            waypoints,
            cruiseAltitudeFt,
        }: {
            departureRunway?: AeroflyFlightServiceRunway;
            destinationRunway?: AeroflyFlightServiceRunway;
            waypoints?: AeroflyFlightServiceWaypoint[];
            cruiseAltitudeFt?: number;
        } = {},
    ): AeroflyNavigationConfig {
        this.aeroflyFlight.navigation.waypoints = [
            new AeroflyNavRouteOrigin(origin.identifier, origin.longitude, origin.latitude, {
                elevation_ft: origin.elevation_ft,
            }),
            ...(departureRunway
                ? [departureRunway].map((r) =>
                      AeroflyFlightHelper.positionRunwayWaypoint(
                          new AeroflyNavRouteDepartureRunway(r.identifier, origin.longitude, origin.latitude, {
                              elevation_ft: r.elevation_ft ?? origin.elevation_ft,
                              runwayLength: r.length ?? 1500,
                              direction_degree: r.direction_degree,
                          }),
                      ),
                  )
                : []),
            ...(waypoints ?? []).map(
                (wp) =>
                    new AeroflyNavRouteWaypoint(wp.identifier, wp.longitude, wp.latitude, {
                        flyOver: wp.flyOver ?? false,
                        altitude_ft: wp.altitude_ft,
                    }),
            ),
            ...(destinationRunway
                ? [destinationRunway].map((r) =>
                      AeroflyFlightHelper.positionRunwayWaypoint(
                          new AeroflyNavRouteDestinationRunway(
                              r.identifier,
                              destination.longitude,
                              destination.latitude,
                              {
                                  elevation_ft: r.elevation_ft ?? destination.elevation_ft,
                                  runwayLength: r.length ?? 1500,
                                  direction_degree: r.direction_degree,
                              },
                          ),
                      ),
                  )
                : []),
            new AeroflyNavRouteDestination(destination.identifier, destination.longitude, destination.latitude, {
                elevation_ft: destination.elevation_ft,
            }),
        ];

        if (cruiseAltitudeFt !== undefined) {
            this.aeroflyFlight.navigation.cruiseAltitude_ft = cruiseAltitudeFt;
        }

        return this.aeroflyFlight.navigation;
    }

    async exportFlightplanToFile(filePath: string): Promise<void> {
        ExportFileWriter.exportFlightplanToFile(filePath, this.aeroflyFlight);
    }

    getImportFiles(): string[] | null {
        const importFileFinder = new ImportFileFinderService(this.config);
        return importFileFinder.findImportFiles();
    }

    getImportableFlightplans(filePath: string): string[] {
        return ImportFileReader.getFlightplansFromFile(filePath);
    }

    importFlightplanFromFile(filePath: string, index = 0): void {
        ImportFileReader.importFile(filePath, this.aeroflyFlight, index);
        this.setFlightPositionToDeparture();
        this.updateCurrentAircraft();
    }

    // ----------------------------------------------------------

    setTimeAndDate(timeDate: string): AeroflyTimeUtc {
        this.aeroflyFlight.timeUtc.time = new Date(timeDate);
        return this.aeroflyFlight.timeUtc;
    }

    getTimeAndDate(): Date {
        return this.aeroflyFlight.timeUtc.time;
    }

    getTimeAndDateDeparture() {
        return AeroflyFlightHelper.getLocalTimeAndDate(this.aeroflyFlight);
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
        const timeZone = AeroflyFlightHelper.getLocalTimeZoneOffset(this.aeroflyFlight);
        if (timeZone === 0) {
            return "Z";
        }

        return `${timeZone >= 0 ? "+" : "-"}${Math.abs(timeZone).toString().padStart(2, "0")}:00`;
    }

    /**
     * @returns e.g. "UTC" or "UTC+2" nautical time zone offset based on the coordinates of the departure airport
     */
    getDepartureTimeZoneUTCString(): string {
        const timeZone = AeroflyFlightHelper.getLocalTimeZoneOffset(this.aeroflyFlight);

        return `UTC${timeZone >= 0 ? "+" : "-"}${Math.abs(Math.round(timeZone))}`;
    }

    // ----------------------------------------------------------

    setWeatherFromMETAR(metar: string): void {
        const converter = new MetarToAeroflyFlightConverter();
        converter.convert(metar, this.aeroflyFlight);
    }

    /**
     * Modify weather by calling METAR / TAF API.
     * TAFs will be called if date is set in the future.
     * @param airportCode ICAO code
     * @returns modified weather settings
     */
    async setWeatherViaApi(airportCode: string): Promise<object> {
        const api = new AviationWeatherApiAerofly();

        if (this.aeroflyFlight.timeUtc.time > new Date()) {
            await api.fetchTafToFlight(airportCode, this.aeroflyFlight);
        } else {
            await api.fetchMetarToFlight(airportCode, this.aeroflyFlight);
        }

        return this.getWeather();
    }

    // ----------------------------------------------------------

    setWeather(
        visibilityM: number,
        temperatureCelsius: number,
        directionDegrees: number,
        speedKts: number,
        gustsKts?: number,
    ): object {
        this.setVisibilityM(visibilityM);
        this.setTemperature(temperatureCelsius);
        this.setWind(directionDegrees, speedKts, gustsKts);

        return this.getWeather();
    }

    setWeatherViaFlightCategory(category: AeroflylightCategoryUs) {
        this.aeroflyFlight.clouds = []; // Clear existing clouds
        switch (category) {
            case "LIFR":
                this.aeroflyFlight.visibility_sm = Math.min(this.aeroflyFlight.visibility_sm, 0.75);
                break;
            case "IFR":
                this.aeroflyFlight.visibility_sm = 1;
                break;
            case "MVFR":
                this.aeroflyFlight.visibility_sm = 3;
                break;
            default: // VFR
                this.aeroflyFlight.visibility_sm = Math.max(this.aeroflyFlight.visibility_sm, 5.25);
                break;
        }
    }
    setWeatherViaFlightCategoryIcao(category: AeroflylightCategoryIcao) {
        this.aeroflyFlight.clouds = []; // Clear existing clouds
        switch (category) {
            case "IFR":
                this.aeroflyFlight.visibility_meter = Math.min(this.aeroflyFlight.visibility_meter, 4999);
                break;
            default: // VFR
                this.aeroflyFlight.visibility_meter = Math.max(this.aeroflyFlight.visibility_meter, 5000);
                break;
        }
    }

    getWeather(): object {
        return {
            ...this.aeroflyFlight.wind,
            visibility_meter: this.aeroflyFlight.visibility_meter,
            clouds: this.aeroflyFlight.clouds,
        };
    }

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

    setClouds(clouds: AeroflyFlightServiceCloud[]): AeroflySettingsCloud[] {
        this.aeroflyFlight.clouds = []; // Clear existing clouds
        this.aeroflyFlight.clouds = clouds.map((cloud) =>
            AeroflySettingsCloud.createInFeet(cloud.cloud_coverage, cloud.base_feet_agl),
        );

        return this.aeroflyFlight.clouds;
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

    /**
     * Will only be executed if last update check had a sufficient cool down
     * @returns null if no update is needs, GithubReleaseApiPayload if an update is available
     */
    async getUpdateInformation(force = false): Promise<GithubReleaseApiPayload | null> {
        if (!this.config.isUpdateCheckNeeded() && !force) {
            return null;
        }
        const update = new UpdateCheckService(
            APPLICATION_INFORMATION.github.username,
            APPLICATION_INFORMATION.github.reponame,
        );

        this.config.lastUpdateCheck = new Date();
        return update.isUpdateAvailable(force ? "0.0.0" : APPLICATION_INFORMATION.version);
    }

    writeFile(): void {
        this.aeroflyMainConfigReader.write(this.aeroflyFlight);
    }
}
