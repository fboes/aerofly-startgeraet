import {
  AeroflyFlight,
  AeroflyNavRouteDepartureRunway,
  AeroflyNavRouteDestinationRunway,
  AeroflySettingsCloud,
} from "@fboes/aerofly-custom-missions";
export type AeroflylightCategoryIcao = "VFR" | "IFR";
export type AeroflylightCategory = AeroflylightCategoryIcao | "MVFR" | "LIFR";
/**
 * Offer additional properties derived from `AeroflyFlight` classes
 */
export declare class AeroflyFlightHelper {
  /**
   * @returns total flight distance in meters
   */
  static getFlightplanDistance(aeroflyFlight: AeroflyFlight): number;
  /**
   * @returns nautical time zone offset based on the coordinates of the departure airport
   */
  static getDepartureTimeZone(aeroflyFlight: AeroflyFlight): number;
  /**
   * @returns the given runway position moved by its length along its direction to the possible runway threshold (instead of its center)
   */
  static positionRunwayWaypoint<T extends AeroflyNavRouteDepartureRunway | AeroflyNavRouteDestinationRunway>(
    waypoint: T,
  ): T;
  static getFlightCategory(aeroflyFlight: AeroflyFlight): AeroflylightCategory;
  static getIcaoFLightCategory(aeroflyFlight: AeroflyFlight): AeroflylightCategoryIcao;
  static getCeiling(aeroflyFlight: AeroflyFlight): AeroflySettingsCloud | undefined;
}
//# sourceMappingURL=AeroflyFlightHelper.d.ts.map
