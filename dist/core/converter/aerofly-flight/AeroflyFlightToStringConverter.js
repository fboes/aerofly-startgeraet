import { AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestination, AeroflyNavRouteDestinationRunway, AeroflyNavRouteOrigin, AeroflyNavRouteWaypoint, } from "@fboes/aerofly-custom-missions";
export class AeroflyFlightToStringConverter {
    getFlightplanTitle(flightplan) {
        return `Flightplan ${flightplan.navigation.waypoints.at(0)?.identifier ?? "???"} → ${flightplan.navigation.waypoints.at(-1)?.identifier ?? "???"}`;
    }
    /**
     *
     * @param {AeroflyNavRouteBase} wp Waypoint to get altitude / elevation from
     * @returns {number | null} altitude / elevation in meters
     */
    getWaypointAltitude(wp) {
        if (wp instanceof AeroflyNavRouteWaypoint) {
            return wp.altitude;
        }
        else if (wp instanceof AeroflyNavRouteOrigin ||
            wp instanceof AeroflyNavRouteDepartureRunway ||
            wp instanceof AeroflyNavRouteDestinationRunway ||
            wp instanceof AeroflyNavRouteDestination) {
            return wp.elevation;
        }
        return null;
    }
    getWaypointSimplifiedType(wp) {
        switch (wp.constructor) {
            case AeroflyNavRouteOrigin:
            case AeroflyNavRouteDestination:
                return "airport";
            case AeroflyNavRouteDepartureRunway:
            case AeroflyNavRouteDestinationRunway:
                return "runway";
            default:
                return wp instanceof AeroflyNavRouteWaypoint && wp.navaidFrequency ? "navaid" : "waypoint";
        }
    }
}
