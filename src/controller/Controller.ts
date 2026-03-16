import AeroflyAircraftLiveries from "@fboes/aerofly-data/data/aircraft-liveries.json" with { type: "json" };
import type { AeroflyAircraft, AeroflyAircraftLivery } from "@fboes/aerofly-data/data/aircraft-liveries.json";
import {
  AeroflyFlight,
  AeroflyNavRouteDepartureRunway,
  AeroflyNavRouteDestination,
  AeroflyNavRouteOrigin,
  AeroflySettingsCloud,
  AeroflySettingsFlight,
} from "@fboes/aerofly-custom-missions";
import { SimBriefAerofly } from "../import/SimBriefAerofly.js";
import { AviationWeatherApiAerofly } from "../import/AviationWeatherApiAerofly.js";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";
import { Config } from "../model/Config.js";
import { AeroflyMainConfigReader } from "../model/AeroflyMainConfigReader.js";
import { AeroflyFlightHelper } from "../model/AeroflyFlightHelper.js";
import { ImportFileFinder } from "../import/ImportFileFinder.js";
import { ImportFile } from "../import/ImportFile.js";

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
export class Controller {
  protected readonly aeroflyAircraftDatabase = AeroflyAircraftLiveries;
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

  readMainMcf(): AeroflyFlight {
    return this.aeroflyMainConfigReader.read();
  }

  // ----------------------------------------------------------

  getAircraftLiveriesData(aeroflyCodeAircraft: string): AeroflyAircraftLivery[] {
    return this.getCurrentAircraftData(aeroflyCodeAircraft)?.liveries ?? [];
  }

  getCurrentAircraftData(aeroflyCodeAircraft: string): AeroflyAircraft | undefined {
    return this.aeroflyAircraftDatabase.find((aircraft) => aircraft.aeroflyCode === aeroflyCodeAircraft);
  }

  getAllAircraftData(): AeroflyAircraft[] {
    return this.aeroflyAircraftDatabase;
  }

  setAircraft(aeroflyCodeAircraft: string, aeroflyCodeLivery: string): void {
    this.currentAircraft = this.getCurrentAircraftData(aeroflyCodeAircraft);
    this.currentLivery = this.currentAircraft?.liveries.find((livery) => livery.aeroflyCode === aeroflyCodeLivery);
    this.aeroflyFlight.setAircraftName(aeroflyCodeAircraft);
    this.aeroflyFlight.aircraft.paintscheme = aeroflyCodeLivery;
  }

  getAircraft(): string {
    return this.aeroflyFlight.aircraft.name;
  }

  getLivery(): string {
    return this.aeroflyFlight.aircraft.paintscheme;
  }

  getAircraftString(): string {
    if (!this.currentAircraft) {
      return "No aircraft selected";
    }
    return `${this.currentAircraft.nameFull} - ${this.currentLivery?.name ?? "Default Livery"}`;
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

  getFuelAndPayloadString(): string {
    return this.getFuel() ? `${this.getFuel()} / ${this.getPayload()} kg` : "Unset";
  }

  getMaxPayload(): number {
    return this.currentAircraft ? (this.currentAircraft.maximumPayloadKg ?? 0) : 0;
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

  getFlightplanString(): string {
    return `${this.getFlightplanDepartureAirportString()} → ${this.getFlightplanArrivalAirportString()} (${this.getFlightplanDistanceString()})`;
  }

  getFlightplanWaypointsString(): string {
    return this.aeroflyFlight.navigation.waypoints
      .map((wp: AeroflyNavRouteBase): string => {
        return wp.identifier;
      })
      .join(" → ");
  }

  /**
   * @returns in meters
   */
  getFlightplanDistance(): number {
    return new AeroflyFlightHelper(this.aeroflyFlight).getFlightplanDistance();
  }

  getFlightplanDistanceString(): string {
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
    } catch (e) {
      return "Unknown";
    }
  }

  getFlightplanDepartureAirport(): AeroflyNavRouteOrigin | undefined {
    return this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteOrigin);
  }

  getFlightplanDepartureRunway(): AeroflyNavRouteDepartureRunway | undefined {
    return this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteDepartureRunway);
  }

  getFlightplanDepartureAirportString(): string {
    return this.getFlightplanDepartureAirport()?.identifier ?? "Unknown";
  }

  getFlightplanArrivalAirportString(): string {
    return (
      this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteDestination)?.identifier ??
      "Unknown"
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
    const simbrief = new SimBriefAerofly();
    await simbrief.fetchMission(simBriefUserName, this.aeroflyFlight, getWeatherFromDestination);
    this.currentAircraft = this.getCurrentAircraftData(this.aeroflyFlight.aircraft.name);
    this.currentLivery = this.currentAircraft?.liveries.find(
      (livery) => livery.aeroflyCode === this.aeroflyFlight.aircraft.paintscheme,
    );
  }

  // ----------------------------------------------------------

  getImportFiles(): string[] | null {
    const importFileFinder = new ImportFileFinder(this.config);
    return importFileFinder.findImportFiles();
  }

  importFlightplanFromFile(filePath: string): void {
    ImportFile.importFile(filePath, this.aeroflyFlight);
    this.setFlightPositionToDeparture();
  }

  // ----------------------------------------------------------

  setTimeAndDate(timeDate: string): void {
    this.aeroflyFlight.timeUtc.time = new Date(timeDate);
  }

  getTimeAndDate(): Date {
    return this.aeroflyFlight.timeUtc.time;
  }

  getTimeAndDateDeparture(): Date {
    const departureTimeZoneOffset = this.getDepartureTimeZone() * 60;
    const localTime = new Date(this.aeroflyFlight.timeUtc.time.getTime() + departureTimeZoneOffset * 60000);
    return localTime;
  }

  getTimeAndDateString(): string {
    return `${this.dateToString(this.aeroflyFlight.timeUtc.time)} UTC`;
  }

  getTimeAndDateDepartureString(): string {
    const localTime = this.getTimeAndDateDeparture();
    return `${this.dateToString(localTime)} ${this.getDepartureTimeZoneUTCString()}`;
  }

  getTimeAndDateCombinedString(): string {
    return `${this.getTimeAndDateString()} | ${this.getTimeAndDateDepartureString()}`;
  }

  /**
   * @returns e.g. "Z" or "+02:00" nautical time zone offset based on the coordinates of the departure airport
   */
  getDepartureTimeZoneString(): string {
    const timeZone = this.getDepartureTimeZone();
    if (timeZone === 0) {
      return "Z";
    }

    return `${timeZone >= 0 ? "+" : "-"}${Math.abs(timeZone).toString().padStart(2, "0")}:00`;
  }

  /**
   * @returns e.g. "UTC" or "UTC+2" nautical time zone offset based on the coordinates of the departure airport
   */
  getDepartureTimeZoneUTCString(): string {
    const timeZone = this.getDepartureTimeZone();

    return `UTC${timeZone >= 0 ? "+" : "-"}${Math.abs(Math.round(timeZone))}`;
  }

  /**
   * @returns nautical time zone offset based on the coordinates of the departure airport
   */
  getDepartureTimeZone(): number {
    return Math.round(
      (this.aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteOrigin)?.longitude ?? 0) / 15,
    );
  }

  // ----------------------------------------------------------

  async setWeatherFromMETAR(airportCode: string): Promise<void> {
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

  getWindString(): string {
    let wind = `${this.numberToString(this.aeroflyFlight.wind.directionInDegree)}° @ ${this.numberToString(this.aeroflyFlight.wind.speed_kts)}kts`;
    if (this.aeroflyFlight.wind.gust_kts > 0) {
      wind += ` (gusts ${this.numberToString(this.aeroflyFlight.wind.gust_kts)}kts)`;
    }
    return wind;
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

  getVisibilityString(): string {
    if (this.aeroflyFlight.visibility_sm === 10 || this.aeroflyFlight.visibility_meter === 9999) {
      return "10SM / " + this.numberToString(9999) + "m";
    }

    return `${this.numberToString(this.aeroflyFlight.visibility_sm)}SM / ${this.numberToString(this.aeroflyFlight.visibility_meter)}m`;
  }

  // ----------------------------------------------------------

  setTemperature(temperatureCelsius: number): void {
    this.aeroflyFlight.wind.temperature_celsius = temperatureCelsius;
  }

  getTemperature(): number {
    return this.aeroflyFlight.wind.temperature_celsius;
  }

  getTemperatureString(): string {
    return `${this.numberToString(this.aeroflyFlight.wind.temperature_celsius)}°C`;
  }

  // ----------------------------------------------------------

  setClouds(clouds: ControllerCloud[]): void {
    this.aeroflyFlight.clouds = []; // Clear existing clouds
    this.aeroflyFlight.clouds = clouds
      .filter((cloud) => cloud.cloud_coverage > 0)
      .map((cloud) => AeroflySettingsCloud.createInFeet(cloud.cloud_coverage, cloud.base_feet_agl));
  }

  getClouds(): ControllerCloud[] {
    return this.aeroflyFlight.clouds.map((cloud): ControllerCloud => {
      return {
        base_feet_agl: cloud.height_ft,
        cloud_coverage: cloud.density,
      };
    });
  }

  getCloudsString(): string {
    return (
      this.aeroflyFlight.clouds
        .filter((cloud) => cloud.density > 0)
        .map((cloud) => {
          return `${cloud.density_code} @ ${this.numberToString(cloud.height_ft)}ft`;
        })
        .join(" | ") || "CLR"
    );
  }

  // ----------------------------------------------------------

  writeFile(): void {
    this.aeroflyMainConfigReader.write(this.aeroflyFlight);
  }

  numberToString(num: number): string {
    return new Intl.NumberFormat().format(Math.round(num));
  }

  dateToString(date: Date): string {
    return date.toISOString().substring(0, 16).replace("T", " ");
  }
}
