import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyAircraftService } from "../services/AeroflyAircraftService.js";
import { AeroflyAirportService } from "../services/AeroflyAirportService.js";
export type AeroflyFlightFormatterSunPosition = "Day" | "Night" | "Dusk" | "Dawn";
/**
 * Additional methods to have human-readable representations of `AeroflyFlight` properties.
 */
export declare class AeroflyFlightFormatter {
    protected readonly aeroflyFlight: AeroflyFlight;
    protected readonly aircraftService: AeroflyAircraftService;
    protected readonly airportService: AeroflyAirportService;
    constructor(
        aeroflyFlight: AeroflyFlight,
        aircraftService: AeroflyAircraftService,
        airportService: AeroflyAirportService,
    );
    static getAircraft(aeroflyFlight: AeroflyFlight, aircraftService: AeroflyAircraftService): string;
    static getFuelAndPayload(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanIdentifier(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanOriginCode(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanOriginName(aeroflyFlight: AeroflyFlight, airportService: AeroflyAirportService): string;
    static getAirportName(airportCode: string, airportService: AeroflyAirportService): string;
    static getFlightplanDestinationCode(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanDestinationName(aeroflyFlight: AeroflyFlight, airportService: AeroflyAirportService): string;
    static getFlightplanSummary(
        aeroflyFlight: AeroflyFlight,
        aircraftService: AeroflyAircraftService,
        airportService: AeroflyAirportService,
    ): string;
    static getFlightplanWaypoints(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanDistance(aeroflyFlight: AeroflyFlight, aircraftService: AeroflyAircraftService): string;
    static getFlightCategory(aeroflyFlight: AeroflyFlight): string;
    static getWind(aeroflyFlight: AeroflyFlight): string;
    static getTemperature(aeroflyFlight: AeroflyFlight): string;
    static getVisibility(aeroflyFlight: AeroflyFlight): string;
    static getClouds(aeroflyFlight: AeroflyFlight): string;
    static getSunPositionName(aeroflyFlight: AeroflyFlight): AeroflyFlightFormatterSunPosition;
    static numberToString(num: number): string;
    static dateToString(date: Date): string;
}
//# sourceMappingURL=AeroflyFlightFormatter.d.ts.map
