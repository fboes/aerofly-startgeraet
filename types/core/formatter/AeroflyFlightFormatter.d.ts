import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
export declare class AeroflyFlightFormatter {
    static getAircraft(aeroflyFlight: AeroflyFlight): string;
    static getFuelAndPayload(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanIdentifier(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanOriginCode(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanDestinationCode(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanSummary(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanWaypoints(aeroflyFlight: AeroflyFlight): string;
    static getFlightplanDistance(aeroflyFlight: AeroflyFlight): string;
    static getWind(aeroflyFlight: AeroflyFlight): string;
    static getTemperature(aeroflyFlight: AeroflyFlight): string;
    static getVisibility(aeroflyFlight: AeroflyFlight): string;
    static getClouds(aeroflyFlight: AeroflyFlight): string;
    static numberToString(num: number): string;
    static dateToString(date: Date): string;
}
//# sourceMappingURL=AeroflyFlightFormatter.d.ts.map