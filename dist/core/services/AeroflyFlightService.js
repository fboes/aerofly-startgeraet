import { AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestination, AeroflyNavRouteDestinationRunway, AeroflyNavRouteOrigin, AeroflyNavRouteWaypoint, AeroflySettingsCloud, AeroflySettingsFlight, } from "@fboes/aerofly-custom-missions";
import { SimBriefAeroflyApi } from "../api/SimBriefAeroflyApi.js";
import { AviationWeatherApiAerofly } from "../api/AviationWeatherAeroflyApi.js";
import { AeroflyMainConfigReader } from "../io/AeroflyMainConfigReader.js";
import { ImportFileFinderService } from "./ImportFileFinderService.js";
import * as ImportFileReader from "../io/importFlightplan.js";
import * as ExportFileWriter from "../io/exportFlightplan.js";
import * as AeroflyFlightFormatter from "../formatter/AeroflyFlightFormatter.js";
import * as AeroflyFlightHelper from "../util/AeroflyFlightHelper.js";
import { MetarToAeroflyFlightConverter } from "../converter/other/MetarToAeroflyFlightConverter.js";
import { AeroflyFlightFallback } from "../data/AeroflyFlightFallback.js";
import { RoutePlanService } from "./RoutePlanService.js";
import { getAeroflyAircraft } from "./getAeroflyAircraft.js";
import { UpdateCheckService } from "./UpdateCheckService.js";
import { APPLICATION_INFORMATION } from "./getApplicationInformation.js";
import { getAeroflyAirportByIcaoCode } from "./getAeroflyAirport.js";
/**
 * AeroflyFlightService class that manages the state of the application and provides
 * methods to interact with the Aerofly DTO data.
 */
export class AeroflyFlightService {
    config;
    currentAircraft;
    aeroflyFlight;
    aeroflyMainConfigReader;
    constructor(config) {
        this.config = config;
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
    getAeroflyFlight() {
        return this.aeroflyFlight;
    }
    setAircraft(aeroflyCodeAircraft, aeroflyCodeLivery) {
        this.aeroflyFlight.setAircraftName(aeroflyCodeAircraft);
        this.aeroflyFlight.aircraft.paintscheme = aeroflyCodeLivery;
        this.updateCurrentAircraft();
        return this.aeroflyFlight.aircraft;
    }
    updateCurrentAircraft() {
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
    getAircraft() {
        return this.aeroflyFlight.aircraft.name;
    }
    getLivery() {
        return this.aeroflyFlight.aircraft.paintscheme;
    }
    getAircraftData() {
        return this.currentAircraft;
    }
    // ----------------------------------------------------------
    /**
     *
     * @param fuel kg
     * @param payload kg
     * @returns fuel load setting
     */
    setFuelAndPayload(fuel, payload) {
        fuel = Math.max(0, Math.min(fuel, this.getMaxFuel()));
        payload = Math.max(0, Math.min(payload, this.getMaxRemainingPayload()));
        this.aeroflyFlight.fuelLoadSetting.fuelMass = fuel;
        this.aeroflyFlight.fuelLoadSetting.payloadMass = payload;
        this.aeroflyFlight.fuelLoadSetting.configuration = "Keep";
        return this.aeroflyFlight.fuelLoadSetting;
    }
    setFuel(fuel) {
        this.setFuelAndPayload(fuel, this.getPayload());
    }
    getFuel() {
        return this.aeroflyFlight.fuelLoadSetting.fuelMass;
    }
    getPayload() {
        return this.aeroflyFlight.fuelLoadSetting.payloadMass;
    }
    getMaxPayload() {
        return this.currentAircraft
            ? (this.currentAircraft.maximumPayloadKg ??
                (this.currentAircraft.maximumTakeoffMassKg ?? 0) - (this.currentAircraft.operatingEmptyMassKg ?? 0))
            : 0;
    }
    /**
     *
     * @returns returns the remaining payload after fuel has been set, disregarding currently loaded payload. This is useful to calculate the maximum payload that can be loaded based on the fuel weight.
     */
    getMaxRemainingPayload() {
        if (!this.currentAircraft) {
            return 0;
        }
        return ((this.currentAircraft.maximumTakeoffMassKg ?? 0) -
            (this.currentAircraft.operatingEmptyMassKg ?? 0) -
            this.getFuel());
    }
    getMaxFuel() {
        return this.currentAircraft ? (this.currentAircraft.maximumFuelMassKg ?? 0) : 0;
    }
    // ----------------------------------------------------------
    getFlightplanDepartureAirport() {
        return this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteOrigin);
    }
    getFlightplanDepartureRunway() {
        return this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteDepartureRunway);
    }
    getFlightplanDepartureAirportString() {
        return this.getFlightplanDepartureAirport()?.identifier ?? "";
    }
    getFlightplanArrivalAirportString() {
        return (this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteDestination)
            ?.identifier ?? "");
    }
    getFlightplanLegs(trueAirspeed_kts = 0, consolidated = false) {
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
    setFlightPosition(longitude, latitude, altitude_meter, heading_degree, speed_kts = undefined, configuration = undefined) {
        if (speed_kts === undefined) {
            speed_kts =
                configuration === "OnGround" || !this.currentAircraft?.cruiseSpeedKts
                    ? 0
                    : this.currentAircraft?.cruiseSpeedKts;
        }
        configuration = configuration ?? (speed_kts > 0 ? "Cruise" : "OnGround");
        this.aeroflyFlight.flightSetting = new AeroflySettingsFlight(longitude, latitude, altitude_meter, heading_degree, speed_kts, {
            configuration,
            onGround: configuration === "OnGround",
        });
        return this.aeroflyFlight.flightSetting;
    }
    setFlightPositionToDeparture() {
        const departureAirport = this.getFlightplanDepartureAirport();
        if (!departureAirport) {
            return;
        }
        const departureRunway = this.getFlightplanDepartureRunway();
        const runwayDirection = departureRunway?.direction_degree ?? 0;
        this.aeroflyFlight.flightSetting = new AeroflySettingsFlight(departureAirport.longitude, departureAirport.latitude, departureAirport.elevation ?? 0, runwayDirection, 0, {
            airport: departureAirport.identifier,
            runway: departureRunway?.identifier,
            configuration: "OnGround",
            onGround: true,
        });
    }
    setCruise(cruiseAltitudeFt, cruiseSpeedKts) {
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
    async importFlightplanFromSimBrief(simBriefUserName, getWeatherFromDestination = 0) {
        try {
            const simbrief = new SimBriefAeroflyApi();
            await simbrief.fetchMission(simBriefUserName, this.aeroflyFlight, getWeatherFromDestination);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("Unknown UserID")) {
                this.config.simBriefUserName = "";
            }
            throw error instanceof Error ? error : new Error("An unknown error occurred while fetching SimBrief data");
        }
        this.updateCurrentAircraft();
    }
    setQuickFlightplan(origin, destination) {
        const originData = getAeroflyAirportByIcaoCode(origin);
        if (!originData) {
            throw new Error(`Could not find origin airport with ICAO cdoe "${origin}"`);
        }
        const destinationData = getAeroflyAirportByIcaoCode(destination);
        if (!destinationData) {
            throw new Error(`Could not find destination airport with ICAO cdoe "${origin}"`);
        }
        this.setFlightplan({
            identifier: originData.code,
            longitude: originData.lon,
            latitude: originData.lat,
        }, {
            identifier: destinationData.code,
            longitude: destinationData.lon,
            latitude: destinationData.lat,
        });
    }
    setFlightplan(origin, destination, { departureRunway, destinationRunway, waypoints, cruiseAltitudeFt, } = {}) {
        this.aeroflyFlight.navigation.waypoints = [
            new AeroflyNavRouteOrigin(origin.identifier, origin.longitude, origin.latitude, {
                elevation_ft: origin.elevation_ft,
            }),
            ...(departureRunway
                ? [departureRunway].map((r) => AeroflyFlightHelper.positionRunwayWaypoint(new AeroflyNavRouteDepartureRunway(r.identifier, origin.longitude, origin.latitude, {
                    elevation_ft: r.elevation_ft ?? origin.elevation_ft,
                    runwayLength: r.length ?? 1500,
                    direction_degree: r.direction_degree,
                })))
                : []),
            ...(waypoints ?? []).map((wp) => new AeroflyNavRouteWaypoint(wp.identifier, wp.longitude, wp.latitude, {
                flyOver: wp.flyOver ?? false,
                altitude_ft: wp.altitude_ft,
            })),
            ...(destinationRunway
                ? [destinationRunway].map((r) => AeroflyFlightHelper.positionRunwayWaypoint(new AeroflyNavRouteDestinationRunway(r.identifier, destination.longitude, destination.latitude, {
                    elevation_ft: r.elevation_ft ?? destination.elevation_ft,
                    runwayLength: r.length ?? 1500,
                    direction_degree: r.direction_degree,
                })))
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
    async exportFlightplanToFile(filePath) {
        ExportFileWriter.exportFlightplanToFile(filePath, this.aeroflyFlight);
    }
    getImportFiles() {
        const importFileFinder = new ImportFileFinderService(this.config);
        return importFileFinder.findImportFiles();
    }
    getImportableFlightplans(filePath) {
        return ImportFileReader.getFlightplansFromFile(filePath);
    }
    importFlightplanFromFile(filePath, index = 0) {
        ImportFileReader.importFile(filePath, this.aeroflyFlight, index);
        this.setFlightPositionToDeparture();
        this.updateCurrentAircraft();
    }
    // ----------------------------------------------------------
    setTimeAndDate(timeDate) {
        this.aeroflyFlight.timeUtc.time = new Date(timeDate);
        return this.aeroflyFlight.timeUtc;
    }
    getTimeAndDate() {
        return this.aeroflyFlight.timeUtc.time;
    }
    getTimeAndDateDeparture() {
        return AeroflyFlightHelper.getLocalTimeAndDate(this.aeroflyFlight);
    }
    getTimeAndDateString() {
        return `${AeroflyFlightFormatter.dateToString(this.aeroflyFlight.timeUtc.time)} UTC`;
    }
    getTimeAndDateDepartureString() {
        const localTime = this.getTimeAndDateDeparture();
        return `${AeroflyFlightFormatter.dateToString(localTime)} ${this.getDepartureTimeZoneUTCString()}`;
    }
    getTimeAndDateCombinedString() {
        return `${this.getTimeAndDateString()} | ${this.getTimeAndDateDepartureString()} (${AeroflyFlightFormatter.getSunPositionName(this.aeroflyFlight)})`;
    }
    /**
     * @returns e.g. "Z" or "+02:00" nautical time zone offset based on the coordinates of the departure airport
     */
    getDepartureTimeZoneString() {
        const timeZone = AeroflyFlightHelper.getLocalTimeZoneOffset(this.aeroflyFlight);
        if (timeZone === 0) {
            return "Z";
        }
        return `${timeZone >= 0 ? "+" : "-"}${Math.abs(timeZone).toString().padStart(2, "0")}:00`;
    }
    /**
     * @returns e.g. "UTC" or "UTC+2" nautical time zone offset based on the coordinates of the departure airport
     */
    getDepartureTimeZoneUTCString() {
        const timeZone = AeroflyFlightHelper.getLocalTimeZoneOffset(this.aeroflyFlight);
        return `UTC${timeZone >= 0 ? "+" : "-"}${Math.abs(Math.round(timeZone))}`;
    }
    // ----------------------------------------------------------
    setWeatherFromMETAR(metar) {
        const converter = new MetarToAeroflyFlightConverter();
        converter.convert(metar, this.aeroflyFlight);
    }
    /**
     * Modify weather by calling METAR / TAF API.
     * TAFs will be called if date is set in the future.
     * @param airportCode ICAO code
     * @returns modified weather settings
     */
    async setWeatherViaApi(airportCode) {
        const api = new AviationWeatherApiAerofly();
        if (this.aeroflyFlight.timeUtc.time > new Date()) {
            await api.fetchTafToFlight(airportCode, this.aeroflyFlight);
        }
        else {
            await api.fetchMetarToFlight(airportCode, this.aeroflyFlight);
        }
        return this.getWeather();
    }
    // ----------------------------------------------------------
    setWeather(visibilityM, temperatureCelsius, directionDegrees, speedKts, gustsKts) {
        this.setVisibilityM(visibilityM);
        this.setTemperature(temperatureCelsius);
        this.setWind(directionDegrees, speedKts, gustsKts);
        return this.getWeather();
    }
    setWeatherViaFlightCategory(category) {
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
    setWeatherViaFlightCategoryIcao(category) {
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
    getWeather() {
        return {
            ...this.aeroflyFlight.wind,
            visibility_meter: this.aeroflyFlight.visibility_meter,
            clouds: this.aeroflyFlight.clouds,
        };
    }
    setWind(directionDegrees, speedKts, gustsKts) {
        this.aeroflyFlight.wind.directionInDegree = directionDegrees;
        this.aeroflyFlight.wind.speed_kts = speedKts;
        this.aeroflyFlight.wind.gust_kts = gustsKts ?? 0;
    }
    getWindDirection() {
        return this.aeroflyFlight.wind.directionInDegree;
    }
    getWindSpeed() {
        return this.aeroflyFlight.wind.speed_kts;
    }
    getWindGusts() {
        return this.aeroflyFlight.wind.gust_kts;
    }
    // ----------------------------------------------------------
    setVisibilitySM(visibilitySM) {
        this.aeroflyFlight.visibility_sm = visibilitySM;
    }
    setVisibilityM(visibilityM) {
        this.aeroflyFlight.visibility_meter = visibilityM;
    }
    getVisibilitySM() {
        return this.aeroflyFlight.visibility_sm;
    }
    getVisibilityM() {
        return this.aeroflyFlight.visibility_meter;
    }
    // ----------------------------------------------------------
    setTemperature(temperatureCelsius) {
        this.aeroflyFlight.wind.temperature_celsius = temperatureCelsius;
    }
    getTemperature() {
        return this.aeroflyFlight.wind.temperature_celsius;
    }
    // ----------------------------------------------------------
    setClouds(clouds) {
        this.aeroflyFlight.clouds = []; // Clear existing clouds
        this.aeroflyFlight.clouds = clouds.map((cloud) => AeroflySettingsCloud.createInFeet(cloud.cloud_coverage, cloud.base_feet_agl));
        return this.aeroflyFlight.clouds;
    }
    getClouds() {
        return this.aeroflyFlight.clouds.map((cloud) => {
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
    async getUpdateInformation(force = false) {
        if (!this.config.isUpdateCheckNeeded() && !force) {
            return null;
        }
        const update = new UpdateCheckService(APPLICATION_INFORMATION.github.username, APPLICATION_INFORMATION.github.reponame);
        this.config.lastUpdateCheck = new Date();
        return update.isUpdateAvailable(force ? "0.0.0" : APPLICATION_INFORMATION.version);
    }
    writeFile() {
        this.aeroflyMainConfigReader.write(this.aeroflyFlight);
    }
}
