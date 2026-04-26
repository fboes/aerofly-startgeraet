import { AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestination, AeroflyNavRouteDestinationRunway, AeroflyNavRouteOrigin, AeroflyNavRouteWaypoint, } from "@fboes/aerofly-custom-missions";
export class AeroflyFlightToStringConverter {
    getFlightplanTitle(flightplan) {
        return `Flightplan ${flightplan.navigation.waypoints.at(0)?.identifier ?? "???"} → ${flightplan.navigation.waypoints.at(-1)?.identifier ?? "???"}`;
    }
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
    getWaypointType(wp) {
        switch (wp.constructor) {
            case AeroflyNavRouteOrigin:
                return "origin";
            case AeroflyNavRouteDestination:
                return "destination";
            case AeroflyNavRouteDepartureRunway:
                return "departure_runway";
            case AeroflyNavRouteDestinationRunway:
                return "destination_runway";
            default:
                return "waypoint";
        }
    }
}
