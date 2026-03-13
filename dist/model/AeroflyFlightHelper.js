import { Point } from "@fboes/geojson";
export class AeroflyFlightHelper {
    constructor(aeroflyFlight) {
        this.aeroflyFlight = aeroflyFlight;
    }
    /**
     *
     * @returns in meters
     */
    getFlightplanDistance() {
        let currentCoodinates = null;
        return this.aeroflyFlight.navigation.waypoints.reduce((acc, routePoint) => {
            const newCoordinates = new Point(routePoint.longitude, routePoint.latitude);
            if (currentCoodinates) {
                const vector = currentCoodinates.getVectorTo(newCoordinates);
                acc += vector.meters; // Distance in meters
            }
            currentCoodinates = newCoordinates;
            return acc;
        }, 0);
    }
}
