import { AeroflyNavRouteOrigin } from "@fboes/aerofly-custom-missions";
import { Point } from "@fboes/geojson";
/**
 * Offer additional properties derived from `AeroflyFlight` classes
 */
export class AeroflyFlightHelper {
    /**
     *
     * @returns in meters
     */
    static getFlightplanDistance(aeroflyFlight) {
        let currentCoodinates = null;
        return aeroflyFlight.navigation.waypoints.reduce((acc, routePoint) => {
            const newCoordinates = new Point(routePoint.longitude, routePoint.latitude);
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
    static getDepartureTimeZone(aeroflyFlight) {
        return Math.round((aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteOrigin)?.longitude ?? 0) / 15);
    }
}
