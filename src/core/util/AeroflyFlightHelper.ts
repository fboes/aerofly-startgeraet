import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { Point } from "@fboes/geojson";

export class AeroflyFlightHelper {
  constructor(protected aeroflyFlight: AeroflyFlight) {}

  /**
   *
   * @returns in meters
   */
  getFlightplanDistance(): number {
    let currentCoodinates: Point | null = null;
    return this.aeroflyFlight.navigation.waypoints.reduce((acc, routePoint) => {
      const newCoordinates: Point = new Point(routePoint.longitude, routePoint.latitude);

      if (currentCoodinates) {
        const vector = currentCoodinates.getVectorTo(newCoordinates);
        acc += vector.meters; // Distance in meters
      }

      currentCoodinates = newCoordinates;

      return acc;
    }, 0);
  }
}
