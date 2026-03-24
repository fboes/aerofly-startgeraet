import { AeroflyFlight, AeroflyNavRouteOrigin } from "@fboes/aerofly-custom-missions";
import { Point } from "@fboes/geojson";

export class AeroflyFlightHelper {
  /**
   *
   * @returns in meters
   */
  static getFlightplanDistance(aeroflyFlight: AeroflyFlight): number {
    let currentCoodinates: Point | null = null;
    return aeroflyFlight.navigation.waypoints.reduce((acc, routePoint) => {
      const newCoordinates: Point = new Point(routePoint.longitude, routePoint.latitude);

      if (currentCoodinates) {
        const vector = currentCoodinates.getVectorTo(newCoordinates);
        acc += vector.meters; // Distance in meters
      }

      currentCoodinates = newCoordinates;

      return acc;
    }, 0);
  }

  /**
   * @returns nautical time zone offset based on the coordinates of the departure airport
   */
  static getDepartureTimeZone(aeroflyFlight: AeroflyFlight): number {
    return Math.round(
      (aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteOrigin)?.longitude ?? 0) / 15,
    );
  }
}
