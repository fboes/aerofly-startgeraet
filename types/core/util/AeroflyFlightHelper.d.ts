import { type AeroflyFlight, type AeroflyNavRouteDepartureRunway, type AeroflyNavRouteDestinationRunway, type AeroflySettingsCloud } from "@fboes/aerofly-custom-missions";
export type AeroflylightCategoryIcao = "VFR" | "IFR";
export type AeroflylightCategoryUs = AeroflylightCategoryIcao | "MVFR" | "LIFR";
/**
 * Offer additional properties derived from `AeroflyFlight` classes
 */
/**
 * @returns nautical time zone offset based on the coordinates of the departure airport
 */
export declare function getLocalTimeZoneOffset(aeroflyFlight: AeroflyFlight): number;
/**
 * @returns the given runway position moved by its length along its direction to the possible runway threshold (instead of its center). Also normalizes the runway identifier to match Aerofly FS4 standards.
 */
export declare function positionRunwayWaypoint<T extends AeroflyNavRouteDepartureRunway | AeroflyNavRouteDestinationRunway>(waypoint: T): T;
export declare function getFlightCategory(aeroflyFlight: AeroflyFlight): AeroflylightCategoryUs;
export declare function getIcaoFlightCategory(aeroflyFlight: AeroflyFlight): AeroflylightCategoryIcao;
export declare function getCeiling(aeroflyFlight: AeroflyFlight): AeroflySettingsCloud | undefined;
export declare function getSunPosition(aeroflyFlight: AeroflyFlight): {
    elevation: number;
    azimuth: number;
};
export declare function getLocalTimeAndDate(aeroflyFlight: AeroflyFlight): Date;
//# sourceMappingURL=AeroflyFlightHelper.d.ts.map