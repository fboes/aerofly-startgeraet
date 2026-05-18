import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyAircraftService } from "../services/AeroflyAircraftService.js";
import { AeroflyAirportService } from "../services/AeroflyAirportService.js";
export type AeroflyFlightFormatterSunPosition = "Day" | "Night" | "Dusk" | "Dawn";
/**
 * Additional methods to have human-readable representations of `AeroflyFlight` properties.
 */
export declare function getAircraft(aeroflyFlight: AeroflyFlight, aircraftService: AeroflyAircraftService): string;
export declare function getFuelAndPayload(aeroflyFlight: AeroflyFlight): string;
export declare function getFlightplanIdentifier(aeroflyFlight: AeroflyFlight): string;
export declare function getFlightplanOriginCode(aeroflyFlight: AeroflyFlight): string;
export declare function getFlightplanOriginName(
    aeroflyFlight: AeroflyFlight,
    airportService: AeroflyAirportService,
): string;
export declare function getAirportName(airportCode: string, airportService: AeroflyAirportService): string;
export declare function getFlightplanDestinationCode(aeroflyFlight: AeroflyFlight): string;
export declare function getFlightplanDestinationName(
    aeroflyFlight: AeroflyFlight,
    airportService: AeroflyAirportService,
): string;
export declare function getFlightplanSummary(
    aeroflyFlight: AeroflyFlight,
    aircraftService: AeroflyAircraftService,
    airportService: AeroflyAirportService,
): string;
export declare function getFlightplanWaypoints(aeroflyFlight: AeroflyFlight): string;
export declare function getFlightplanDistance(
    aeroflyFlight: AeroflyFlight,
    aircraftService: AeroflyAircraftService,
): string;
export declare function getFlightCategory(aeroflyFlight: AeroflyFlight): string;
export declare function getWind(aeroflyFlight: AeroflyFlight): string;
export declare function getTemperature(aeroflyFlight: AeroflyFlight): string;
export declare function getVisibility(aeroflyFlight: AeroflyFlight): string;
export declare function getClouds(aeroflyFlight: AeroflyFlight): string;
export declare function getSunPositionName(aeroflyFlight: AeroflyFlight): AeroflyFlightFormatterSunPosition;
export declare function numberToString(num: number): string;
export declare function dateToString(date: Date): string;
//# sourceMappingURL=AeroflyFlightFormatter.d.ts.map
