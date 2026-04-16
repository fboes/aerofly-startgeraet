import { AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestination, AeroflyNavRouteDestinationRunway, AeroflyNavRouteOrigin, AeroflyNavRouteWaypoint, AeroflySettingsCloud, AeroflySettingsFlight, } from "@fboes/aerofly-custom-missions";
import { SimBriefAeroflyApi } from "../api/SimBriefAeroflyApi.js";
import { AviationWeatherApiAerofly } from "../api/AviationWeatherAeroflyApi.js";
import { AeroflyMainConfigReader } from "../io/AeroflyMainConfigReader.js";
import { ImportFileFinderService } from "./ImportFileFinderService.js";
import { ImportFileReader } from "../io/ImportFileReader.js";
import { ExportFileWriter } from "../io/ExportFileWriter.js";
import { AeroflyAircraftService } from "./AeroflyAircraftService.js";
import { AeroflyFlightFormatter } from "../formatter/AeroflyFlightFormatter.js";
import { AeroflyFlightHelper } from "../util/AeroflyFlightHelper.js";
import { ImportMetarConverter } from "../converter/ImportMetarConverter.js";
import { AeroflyFlightFallback } from "../util/AeroflyFlightFallback.js";
import { AeroflyAirportService } from "./AeroflyAirportService.js";
/**
 * AeroflyFlightService class that manages the state of the application and provides
 * methods to interact with the Aerofly DTO data.
 */
export class AeroflyFlightService {
    config;
    currentAircraft;
    currentLivery;
    aeroflyFlight;
    aeroflyMainConfigReader;
    aircraftService;
    airportService;
    constructor(config) {
        this.config = config;
        this.aircraftService = new AeroflyAircraftService();
        this.airportService = new AeroflyAirportService();
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
    }
    // ----------------------------------------------------------
    getAeroflyFlight() {
        return this.aeroflyFlight;
    }
    setAircraft(aeroflyCodeAircraft, aeroflyCodeLivery) {
        this.currentAircraft = this.aircraftService.getAircraft(aeroflyCodeAircraft);
        this.currentLivery = this.aircraftService.getLiveryForAircraft(this.currentAircraft, aeroflyCodeLivery);
        this.aeroflyFlight.setAircraftName(aeroflyCodeAircraft);
        this.aeroflyFlight.aircraft.paintscheme = aeroflyCodeLivery;
        return this.aeroflyFlight.aircraft;
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
    setFuelAndPayload(fuel, payload) {
        fuel = Math.max(0, Math.min(fuel, this.getMaxFuel()));
        payload = Math.max(0, Math.min(payload, this.getMaxPayload()));
        this.aeroflyFlight.fuelLoadSetting.fuelMass = fuel;
        this.aeroflyFlight.fuelLoadSetting.payloadMass = payload;
        this.aeroflyFlight.fuelLoadSetting.configuration = fuel > 0 ? "Keep" : "Invalid";
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
    setFlightPosition(longitude, latitude, altitude_meter, heading_degree, speed_kts) {
        const onGround = speed_kts === 0 || altitude_meter === 0;
        this.aeroflyFlight.flightSetting = new AeroflySettingsFlight(longitude, latitude, altitude_meter, heading_degree, onGround ? 0 : speed_kts, {
            gear: onGround ? 1 : 0,
            throttle: onGround ? 0 : 0.8,
            flaps: 0,
            configuration: onGround ? "OnGround" : "Cruise",
            onGround,
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
    // ----------------------------------------------------------
    async importFlightplanFromSimBrief(simBriefUserName, getWeatherFromDestination = false) {
        try {
            const simbrief = new SimBriefAeroflyApi(this.aircraftService);
            await simbrief.fetchMission(simBriefUserName, this.aeroflyFlight, getWeatherFromDestination);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("Unknown UserID")) {
                this.config.simBriefUserName = "";
            }
            throw error instanceof Error ? error : new Error("An unknown error occurred while fetching SimBrief data");
        }
        this.currentAircraft = this.aircraftService.getAircraft(this.aeroflyFlight.aircraft.name);
        this.currentLivery = this.aircraftService.getLiveryForAircraft(this.currentAircraft, this.aeroflyFlight.aircraft.paintscheme);
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
        return AeroflyFlightHelper.getTimeAndDateDeparture(this.aeroflyFlight);
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
        const timeZone = AeroflyFlightHelper.getDepartureTimeZone(this.aeroflyFlight);
        if (timeZone === 0) {
            return "Z";
        }
        return `${timeZone >= 0 ? "+" : "-"}${Math.abs(timeZone).toString().padStart(2, "0")}:00`;
    }
    /**
     * @returns e.g. "UTC" or "UTC+2" nautical time zone offset based on the coordinates of the departure airport
     */
    getDepartureTimeZoneUTCString() {
        const timeZone = AeroflyFlightHelper.getDepartureTimeZone(this.aeroflyFlight);
        return `UTC${timeZone >= 0 ? "+" : "-"}${Math.abs(Math.round(timeZone))}`;
    }
    // ----------------------------------------------------------
    setWeatherFromMETAR(metar) {
        const converter = new ImportMetarConverter();
        converter.convert(metar, this.aeroflyFlight);
    }
    async setWeatherViaApi(airportCode) {
        await AviationWeatherApiAerofly.fetchMetarToFlight(airportCode, this.aeroflyFlight);
        return this.getWeather();
    }
    // ----------------------------------------------------------
    setWeather(visibilityM, temperatureCelsius, directionDegrees, speedKts, gustsKts) {
        this.setVisibilityM(visibilityM);
        this.setTemperature(temperatureCelsius);
        this.setWind(directionDegrees, speedKts, gustsKts);
        return this.getWeather();
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
        this.aeroflyFlight.clouds = clouds
            .filter((cloud) => cloud.cloud_coverage > 0)
            .map((cloud) => AeroflySettingsCloud.createInFeet(cloud.cloud_coverage, cloud.base_feet_agl));
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
    writeFile() {
        this.aeroflyMainConfigReader.write(this.aeroflyFlight);
    }
}
