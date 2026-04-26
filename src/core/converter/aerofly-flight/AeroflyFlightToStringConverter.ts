import {
    AeroflyFlight,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";

export type ExportFileConverterWaypointType = "airport" | "runway" | "navaid" | "waypoint";

export abstract class AeroflyFlightToStringConverter {
    // static readonly fileExtension: string;

    abstract convert(flightplan: AeroflyFlight): string;

    getFlightplanTitle(flightplan: AeroflyFlight): string {
        return `Flightplan ${flightplan.navigation.waypoints.at(0)?.identifier ?? "???"} → ${flightplan.navigation.waypoints.at(-1)?.identifier ?? "???"}`;
    }

    protected getWaypointAltitude(wp: AeroflyNavRouteBase): number | null {
        if (wp instanceof AeroflyNavRouteWaypoint) {
            return wp.altitude;
        } else if (
            wp instanceof AeroflyNavRouteOrigin ||
            wp instanceof AeroflyNavRouteDepartureRunway ||
            wp instanceof AeroflyNavRouteDestinationRunway ||
            wp instanceof AeroflyNavRouteDestination
        ) {
            return wp.elevation;
        }
        return null;
    }

    protected getWaypointSimplifiedType(wp: AeroflyNavRouteBase): ExportFileConverterWaypointType {
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

    protected getWaypointType(
        wp: AeroflyNavRouteBase,
    ): import("@fboes/aerofly-custom-missions/types/dto/AeroflyMissionCheckpoint.js").AeroflyMissionCheckpointType {
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
