import AeroflyAircraftLiveries from "@fboes/aerofly-data/data/aircraft-liveries.json" with { type: "json" };
import { AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestination, AeroflyNavRouteOrigin, AeroflySettingsCloud, AeroflySettingsFlight, } from "@fboes/aerofly-custom-missions";
import { SimBriefAeroflyApi } from "../api/SimBriefAeroflyApi.js";
import { AviationWeatherApiAerofly } from "../api/AviationWeatherAeroflyApi.js";
import { AeroflyMainConfigReader } from "../io/AeroflyMainConfigReader.js";
import { AeroflyFlightHelper } from "../util/AeroflyFlightHelper.js";
import { ImportFileFinderService } from "./ImportFileFinderService.js";
import { ImportFileReader } from "../io/ImportFileReader.js";
import { ExportFileWriter } from "../io/ExportFileWriter.js";
/**
 * AeroflyFlightService class that manages the state of the application and provides
 * methods to interact with the Aerofly DTO data.
 */
export class AeroflyFlightService {
    constructor(config) {
        this.config = config;
        this.aeroflyAircraftDatabase = AeroflyAircraftLiveries;
        this.aeroflyMainConfigReader = new AeroflyMainConfigReader(this.config);
        this.aeroflyFlight = this.readMainMcf();
        this.setAircraft(this.aeroflyFlight.aircraft.name, this.aeroflyFlight.aircraft.paintscheme);
        if (this.config.syncTimeOnStartup) {
            this.aeroflyFlight.timeUtc.time = new Date();
        }
    }
    // ----------------------------------------------------------
    readMainMcf() {
        return this.aeroflyMainConfigReader.read();
    }
    // ----------------------------------------------------------
    getCurrentAircraft() {
        return this.currentAircraft;
    }
    getCurrentLivery() {
        return this.currentLivery;
    }
    getAircraftLiveriesData(aeroflyCodeAircraft) {
        return this.findAircraftData(aeroflyCodeAircraft)?.liveries ?? [];
    }
    findAircraftData(aeroflyCodeAircraft) {
        return this.aeroflyAircraftDatabase.find((aircraft) => aircraft.aeroflyCode === aeroflyCodeAircraft);
    }
    getAllAircraftData() {
        return this.aeroflyAircraftDatabase;
    }
    setAircraft(aeroflyCodeAircraft, aeroflyCodeLivery) {
        this.currentAircraft = this.findAircraftData(aeroflyCodeAircraft);
        this.currentLivery = this.currentAircraft?.liveries.find((livery) => livery.aeroflyCode === aeroflyCodeLivery);
        this.aeroflyFlight.setAircraftName(aeroflyCodeAircraft);
        this.aeroflyFlight.aircraft.paintscheme = aeroflyCodeLivery;
    }
    getAircraft() {
        return this.aeroflyFlight.aircraft.name;
    }
    getLivery() {
        return this.aeroflyFlight.aircraft.paintscheme;
    }
    // ----------------------------------------------------------
    setFuelAndPayload(fuel, payload) {
        fuel = Math.max(0, Math.min(fuel, this.getMaxFuel()));
        payload = Math.max(0, Math.min(payload, this.getMaxPayload()));
        this.aeroflyFlight.fuelLoadSetting.fuelMass = fuel;
        this.aeroflyFlight.fuelLoadSetting.payloadMass = payload;
        this.aeroflyFlight.fuelLoadSetting.configuration = fuel > 0 ? "Keep" : "Invalid";
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
        return this.currentAircraft ? (this.currentAircraft.maximumPayloadKg ?? 0) : 0;
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
    getFlightplanString() {
        return `${this.getFlightplanDepartureAirportString()} → ${this.getFlightplanArrivalAirportString()} (${this.getFlightplanDistanceString()})`;
    }
    getFlightplanWaypointsString() {
        return this.aeroflyFlight.navigation.waypoints
            .map((wp) => {
            return wp.identifier;
        })
            .join(" → ");
    }
    /**
     * @returns in meters
     */
    getFlightplanDistance() {
        return new AeroflyFlightHelper(this.aeroflyFlight).getFlightplanDistance();
    }
    getFlightplanDistanceString() {
        try {
            const distanceNm = this.getFlightplanDistance() / 1852;
            const timeH = this.currentAircraft?.cruiseSpeedKts ? distanceNm / this.currentAircraft?.cruiseSpeedKts : 0;
            const timeString = timeH
                ? `, ${Math.floor(timeH / 60)}:${Math.floor((timeH * 60) % 60)
                    .toString()
                    .padStart(2, "0")}h`
                : "";
            return `${this.numberToString(distanceNm)}NM${timeString}`;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }
        catch (e) {
            return "Unknown";
        }
    }
    getFlightplanDepartureAirport() {
        return this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteOrigin);
    }
    getFlightplanDepartureRunway() {
        return this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteDepartureRunway);
    }
    getFlightplanDepartureAirportString() {
        return this.getFlightplanDepartureAirport()?.identifier ?? "Unknown";
    }
    getFlightplanArrivalAirportString() {
        return (this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteDestination)?.identifier ??
            "Unknown");
    }
    setFlightPositionToDeparture() {
        const departureAirport = this.getFlightplanDepartureAirport();
        if (!departureAirport) {
            return;
        }
        const departureRunway = this.getFlightplanDepartureRunway();
        const runwayDirection = departureRunway?.direction_degree ?? 0;
        this.aeroflyFlight.flightSetting = new AeroflySettingsFlight(departureAirport.longitude, departureAirport.latitude, departureAirport.elevation ?? 0, 0, runwayDirection, {
            airport: departureAirport.identifier,
        });
    }
    // ----------------------------------------------------------
    async importFlightplanFromSimBrief(simBriefUserName, getWeatherFromDestination = false) {
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
        this.currentAircraft = this.findAircraftData(this.aeroflyFlight.aircraft.name);
        this.currentLivery = this.currentAircraft?.liveries.find((livery) => livery.aeroflyCode === this.aeroflyFlight.aircraft.paintscheme);
    }
    async exportFlightplanToFile(filePath) {
        ExportFileWriter.exportFlightplanToFile(filePath, this.aeroflyFlight);
    }
    getImportFiles() {
        const importFileFinder = new ImportFileFinderService(this.config);
        return importFileFinder.findImportFiles();
    }
    importFlightplanFromFile(filePath) {
        ImportFileReader.importFile(filePath, this.aeroflyFlight);
        this.setFlightPositionToDeparture();
    }
    // ----------------------------------------------------------
    setTimeAndDate(timeDate) {
        this.aeroflyFlight.timeUtc.time = new Date(timeDate);
    }
    getTimeAndDate() {
        return this.aeroflyFlight.timeUtc.time;
    }
    getTimeAndDateDeparture() {
        const departureTimeZoneOffset = this.getDepartureTimeZone() * 60;
        const localTime = new Date(this.aeroflyFlight.timeUtc.time.getTime() + departureTimeZoneOffset * 60000);
        return localTime;
    }
    getTimeAndDateString() {
        return `${this.dateToString(this.aeroflyFlight.timeUtc.time)} UTC`;
    }
    getTimeAndDateDepartureString() {
        const localTime = this.getTimeAndDateDeparture();
        return `${this.dateToString(localTime)} ${this.getDepartureTimeZoneUTCString()}`;
    }
    getTimeAndDateCombinedString() {
        return `${this.getTimeAndDateString()} | ${this.getTimeAndDateDepartureString()}`;
    }
    /**
     * @returns e.g. "Z" or "+02:00" nautical time zone offset based on the coordinates of the departure airport
     */
    getDepartureTimeZoneString() {
        const timeZone = this.getDepartureTimeZone();
        if (timeZone === 0) {
            return "Z";
        }
        return `${timeZone >= 0 ? "+" : "-"}${Math.abs(timeZone).toString().padStart(2, "0")}:00`;
    }
    /**
     * @returns e.g. "UTC" or "UTC+2" nautical time zone offset based on the coordinates of the departure airport
     */
    getDepartureTimeZoneUTCString() {
        const timeZone = this.getDepartureTimeZone();
        return `UTC${timeZone >= 0 ? "+" : "-"}${Math.abs(Math.round(timeZone))}`;
    }
    /**
     * @returns nautical time zone offset based on the coordinates of the departure airport
     */
    getDepartureTimeZone() {
        return Math.round((this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteOrigin)?.longitude ?? 0) / 15);
    }
    // ----------------------------------------------------------
    async setWeatherFromMETAR(airportCode) {
        await AviationWeatherApiAerofly.fetchMetarToFlight(airportCode, this.aeroflyFlight);
    }
    // ----------------------------------------------------------
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
    getWindString() {
        let wind = `${this.numberToString(this.aeroflyFlight.wind.directionInDegree)}° @ ${this.numberToString(this.aeroflyFlight.wind.speed_kts)}kts`;
        if (this.aeroflyFlight.wind.gust_kts > 0) {
            wind += ` (gusts ${this.numberToString(this.aeroflyFlight.wind.gust_kts)}kts)`;
        }
        return wind;
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
    getVisibilityString() {
        if (this.aeroflyFlight.visibility_sm === 10 || this.aeroflyFlight.visibility_meter === 9999) {
            return "10SM / " + this.numberToString(9999) + "m";
        }
        return `${this.numberToString(this.aeroflyFlight.visibility_sm)}SM / ${this.numberToString(this.aeroflyFlight.visibility_meter)}m`;
    }
    // ----------------------------------------------------------
    setTemperature(temperatureCelsius) {
        this.aeroflyFlight.wind.temperature_celsius = temperatureCelsius;
    }
    getTemperature() {
        return this.aeroflyFlight.wind.temperature_celsius;
    }
    getTemperatureString() {
        return `${this.numberToString(this.aeroflyFlight.wind.temperature_celsius)}°C`;
    }
    // ----------------------------------------------------------
    setClouds(clouds) {
        this.aeroflyFlight.clouds = []; // Clear existing clouds
        this.aeroflyFlight.clouds = clouds
            .filter((cloud) => cloud.cloud_coverage > 0)
            .map((cloud) => AeroflySettingsCloud.createInFeet(cloud.cloud_coverage, cloud.base_feet_agl));
    }
    getClouds() {
        return this.aeroflyFlight.clouds.map((cloud) => {
            return {
                base_feet_agl: cloud.height_ft,
                cloud_coverage: cloud.density,
            };
        });
    }
    getCloudsString() {
        return (this.aeroflyFlight.clouds
            .filter((cloud) => cloud.density > 0)
            .map((cloud) => {
            return `${cloud.density_code} @ ${this.numberToString(cloud.height_ft)}ft`;
        })
            .join(" | ") || "CLR");
    }
    // ----------------------------------------------------------
    writeFile() {
        this.aeroflyMainConfigReader.write(this.aeroflyFlight);
    }
    numberToString(num) {
        return new Intl.NumberFormat().format(Math.round(num));
    }
    dateToString(date) {
        return date.toISOString().substring(0, 16).replace("T", " ");
    }
}
