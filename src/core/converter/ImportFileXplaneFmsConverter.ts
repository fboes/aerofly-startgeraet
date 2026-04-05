import {
    AeroflyFlight,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { ImportFileConverter } from "./ImportFileConverter.js";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";
import { AeroflyFlightHelper } from "../util/AeroflyFlightHelper.js";

// It is 1 for airport, 2 for NDB, 3 for VOR, 11 for named fix and 28 for unnamed lat/lon waypoints.
type XplaneFmsWaypointType = 1 | 2 | 3 | 11 | 28;

type XplaneFmsWaypoint = {
    identifier: string;
    type: XplaneFmsWaypointType;
    lat: number;
    lon: number;
    elevationFeet?: number;
};

/**
 * Import `.fms` flight plan files from X-Plane 11 / 12
 * @see https://developer.x-plane.com/article/flightplan-files-v11-fms-file-format/
 * @see https://xp-soaring.github.io/tasks/x-plane_fms_format.html
 */
export class ImportFileXplaneFms extends ImportFileConverter {
    static readonly fileExtension = "fms";

    convert(content: string, flightplan: AeroflyFlight, index = 0): void {
        const waypoints = this.getWaypoints(content);

        const departureRunway = this.getRunway(content, "DEPRWY");
        const destinationRunway = this.getRunway(content, "DESRWY");

        flightplan.navigation.waypoints = waypoints.flatMap((waypoint, index) =>
            this.convertWaypointToAerofly(
                waypoint,
                index === 0,
                index === waypoints.length - 1,
                departureRunway,
                destinationRunway,
            ),
        );
    }

    private getRunway(content: string, type: "DEPRWY" | "DESRWY"): string | null {
        const match = content.match(new RegExp(`\\s${type} RW(\\S+)`));
        return match ? match[1] : null;
    }

    private getWaypoints(content: string): XplaneFmsWaypoint[] {
        const waypointLines = content.matchAll(/(?:^|\n)(\d+) (\S+).*? ([0-9.+-]+) ([0-9.+-]+) ([0-9.+-]+)(?:\n|$)/gm);
        if (!waypointLines) {
            throw new Error("No nav lines found");
        }
        return Array.from(waypointLines).map(
            (m): XplaneFmsWaypoint => ({
                identifier: m[2],
                type: Number(m[1]) as XplaneFmsWaypointType,
                lat: Number(m[4]),
                lon: Number(m[5]),
                elevationFeet: Number(m[3]),
            }),
        );
    }

    private convertWaypointToAerofly(
        waypoint: XplaneFmsWaypoint,
        isFirst: boolean,
        isLast: boolean,
        departureRunway: string | null,
        destinationRunway: string | null,
    ): AeroflyNavRouteBase[] {
        const uid = this.geoToUid(waypoint.lon, waypoint.lat);
        if (isFirst) {
            const route = [
                new AeroflyNavRouteOrigin(waypoint.identifier, waypoint.lon, waypoint.lat, {
                    elevation_ft: waypoint.elevationFeet,
                    uid,
                }),
            ];
            if (departureRunway) {
                route.push(
                    AeroflyFlightHelper.positionRunwayWaypoint(
                        new AeroflyNavRouteDepartureRunway(departureRunway, waypoint.lon, waypoint.lat, {
                            elevation_ft: waypoint.elevationFeet,
                            direction_degree: Number(departureRunway.replace(/^\D+/, "")) * 10,
                            uid,
                        }),
                    ),
                );
            }
            return route;
        }
        if (isLast) {
            const route = [];
            if (destinationRunway) {
                route.push(
                    AeroflyFlightHelper.positionRunwayWaypoint(
                        new AeroflyNavRouteDestinationRunway(destinationRunway, waypoint.lon, waypoint.lat, {
                            elevation_ft: waypoint.elevationFeet,
                            direction_degree: Number(destinationRunway.replace(/^\D+/, "")) * 10,
                            uid,
                        }),
                    ),
                );
            }
            route.push(
                new AeroflyNavRouteDestination(waypoint.identifier, waypoint.lon, waypoint.lat, {
                    elevation_ft: waypoint.elevationFeet,
                    uid,
                }),
            );
            return route;
        }
        return [
            new AeroflyNavRouteWaypoint(waypoint.identifier, waypoint.lon, waypoint.lat, {
                altitude_ft: waypoint.elevationFeet,
                uid,
            }),
        ];
    }
}
