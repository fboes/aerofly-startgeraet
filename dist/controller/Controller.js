import AeroflyAircraftLiveries from "@fboes/aerofly-data/data/aircraft-liveries.json" with { type: "json" };
import { AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestination, AeroflyNavRouteOrigin, AeroflySettingsCloud, AeroflySettingsFlight, } from "@fboes/aerofly-custom-missions";
import { SimBriefAerofly } from "../import/SimBriefAerofly.js";
import { AviationWeatherApiAerofly } from "../import/AviationWeatherApiAerofly.js";
import { MainConfigReader } from "../model/MainConfigReader.js";
import { AeroflyFlightHelper } from "../model/AeroflyFlightHelper.js";
import { ImportFileFinder } from "../import/ImportFileFinder.js";
import { ImportFile } from "../import/ImportFile.js";
/**
 * Controller class that manages the state of the application and provides
 * methods to interact with the Aerofly DTO data.
 */
export class Controller {
    constructor(conf) {
        this.conf = conf;
        this.aeroflyAircraftDatabase = AeroflyAircraftLiveries;
        this.mainConfigReader = new MainConfigReader(this.conf);
        this.aeroflyFlight = this.readMainMcf();
        this.setAircraft(this.aeroflyFlight.aircraft.name, this.aeroflyFlight.aircraft.paintscheme);
        if (this.conf.syncTimeOnStartup) {
            this.aeroflyFlight.timeUtc.time = new Date();
        }
    }
    // ----------------------------------------------------------
    getMainMcfFilePath() {
        return this.conf.mainMcfFilePath;
    }
    setMainMcfFilePath(mainMcfFilePath) {
        this.conf.mainMcfFilePath = mainMcfFilePath;
    }
    readMainMcf() {
        return this.mainConfigReader.read();
    }
    // ----------------------------------------------------------
    getAircraftLiveriesData(aeroflyCodeAircraft) {
        return this.getCurrentAircraftData(aeroflyCodeAircraft)?.liveries ?? [];
    }
    getCurrentAircraftData(aeroflyCodeAircraft) {
        return this.aeroflyAircraftDatabase.find((aircraft) => aircraft.aeroflyCode === aeroflyCodeAircraft);
    }
    getAllAircraftData() {
        return this.aeroflyAircraftDatabase;
    }
    setAircraft(aeroflyCodeAircraft, aeroflyCodeLivery) {
        this.currentAircraft = this.getCurrentAircraftData(aeroflyCodeAircraft);
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
    getAircraftString() {
        if (!this.currentAircraft) {
            return "No aircraft selected";
        }
        return `${this.currentAircraft.nameFull} - ${this.currentLivery?.name ?? "Default Livery"}`;
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
    getFuelAndPayloadString() {
        return this.getFuel() ? `${this.getFuel()} / ${this.getPayload()} kg` : "Unset";
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
    getFLightplanDepartureRunway() {
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
        const departureRunway = this.getFLightplanDepartureRunway();
        const runwayDirection = departureRunway?.direction_degree ?? 0;
        this.aeroflyFlight.flightSetting = new AeroflySettingsFlight(departureAirport.longitude, departureAirport.latitude, departureAirport.elevation ?? 0, 0, runwayDirection, {
            airport: departureAirport.identifier,
        });
    }
    // ----------------------------------------------------------
    setSimBriefUserName(simBriefUserName) {
        this.conf.simBriefUserName = simBriefUserName;
    }
    getSimBriefUserName() {
        return this.conf.simBriefUserName;
    }
    getSimBriefWeatherFromDestination() {
        return this.conf.simBriefWeatherFromDestination;
    }
    setSimBriefWeatherFromDestination(simBriefWeatherFromDestination) {
        this.conf.simBriefWeatherFromDestination = simBriefWeatherFromDestination;
    }
    async importFlightplanFromSimBrief(simBriefUserName, getWeatherFromDestination = false) {
        const simbrief = new SimBriefAerofly();
        await simbrief.fetchMission(simBriefUserName, this.aeroflyFlight, getWeatherFromDestination);
        this.currentAircraft = this.getCurrentAircraftData(this.aeroflyFlight.aircraft.name);
        this.currentLivery = this.currentAircraft?.liveries.find((livery) => livery.aeroflyCode === this.aeroflyFlight.aircraft.paintscheme);
    }
    // ----------------------------------------------------------
    setImportDirectory(importDirectory) {
        this.conf.importDirectory = importDirectory;
    }
    getImportDirectory() {
        return this.conf.importDirectory;
    }
    getImportFiles() {
        const importFileFinder = new ImportFileFinder(this.conf);
        return importFileFinder.findImportFiles();
    }
    importFlightplanFromFile(filePath) {
        ImportFile.importFile(filePath, this.aeroflyFlight);
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
    getSyncTimeOnStartup() {
        return this.conf.syncTimeOnStartup;
    }
    setSyncTimeOnStartup(syncTimeOnStartup) {
        this.conf.syncTimeOnStartup = syncTimeOnStartup;
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
        this.mainConfigReader.write(this.aeroflyFlight);
    }
    numberToString(num) {
        return new Intl.NumberFormat().format(Math.round(num));
    }
    dateToString(date) {
        return date.toISOString().substring(0, 16).replace("T", " ");
    }
}
