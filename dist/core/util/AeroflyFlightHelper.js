import { AeroflyNavRouteOrigin, } from "@fboes/aerofly-custom-missions";
import { Point, Vector } from "@fboes/geojson";
/**
 * Offer additional properties derived from `AeroflyFlight` classes
 */
export class AeroflyFlightHelper {
    /**
     * @returns total flight distance in meters
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
    /**
     * @returns the given runway position moved by its length along its direction to the possible runway threshold (instead of its center)
     */
    static positionRunwayWaypoint(waypoint) {
        const direction_degree = waypoint.direction_degree ?? Number(waypoint.identifier.replace(/\D+/g, "")) * 10;
        const runwayLength = waypoint.runwayLength ?? 1500;
        const coordinates = new Point(waypoint.longitude, waypoint.latitude);
        const coordinatesNew = coordinates.getPointBy(new Vector(runwayLength / 2, direction_degree + 180));
        waypoint.latitude = coordinatesNew.latitude;
        waypoint.longitude = coordinatesNew.longitude;
        return waypoint;
    }
}
