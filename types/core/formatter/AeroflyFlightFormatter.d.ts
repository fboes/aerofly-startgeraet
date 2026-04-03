import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export type AeroflyFlightFormatterSunPosition = "Day" | "Night" | "Dusk" | "Dawn";
/**
 * Additional methods to have human-readable representations of `AeroflyFlight` properties.
 */
export declare class AeroflyFlightFormatter {
    static getAircraft(aeroflyFlight: AeroflyFlight): string;
    static getFuelAndPayload(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanIdentifier(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanOriginCode(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanOriginName(aeroflyFlight: AeroflyFlight): string;
    static getAirportName(airportCode: string): string;
    static getFlightplanDestinationCode(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanDestinationName(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanSummary(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanWaypoints(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanDistance(aeroflyFlight: AeroflyFlight): string;
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