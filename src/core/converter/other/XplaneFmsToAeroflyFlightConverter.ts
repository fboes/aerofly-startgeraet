import {
    type AeroflyFlight,
    type AeroflyNavRouteBase,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
import { positionRunwayWaypoint } from "../../util/AeroflyFlightHelper.js";

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
export class XplaneFmsToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    static readonly fileName = "X-Plane Flight Plan File";
    static readonly fileExtension = "fms";

    convert(content: string, flightplan: AeroflyFlight, index = 0): void {
        if (index > 0) {
            throw new Error("File format only contains one flight plan");
        }

        const version = this.getVersion(content);
        if (version < 3) {
            throw new Error("Flight plan file format too old, please use X-Plane 11/12 FMS");
        }

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

        flightplan._missionTitle = "";
        flightplan._missionBriefing = "";
    }

    private getVersion(content: string): number {
        const match = content.match(/\s(\d+) VERSION\s/i);
        if (!match || !match[1]) {
            throw new Error("Missing version information from import file");
        }

        return this.parseNumberOrError(match[1]);
    }

    private getRunway(content: string, type: "DEPRWY" | "DESRWY"): string | null {
        const match = content.match(new RegExp(`\\s${type} RW(\\S+)`))?.[1];
        return match ?? null;
    }

    private getWaypoints(content: string): XplaneFmsWaypoint[] {
        const waypointLines = content.matchAll(/(?:^|\n)(\d+) (\S+).*? ([0-9.+-]+) ([0-9.+-]+) ([0-9.+-]+)(?:\n|$)/gm);
        if (!waypointLines) {
            throw new Error("No nav lines found");
        }
        return Array.from(waypointLines)
            .map((m): XplaneFmsWaypoint => {
                if (m.length !== 6) {
                    throw new Error(`Broken waypoint, expected 6, got ${m.length.toString()} cells`);
                }

                const all = m[0];
                const type = m[1];
                const identifier = m[2];
                const elevationFeet = m[3];
                const lat = m[4];
                const lon = m[5];
                if (!identifier || !type || !lat || !lon || !elevationFeet) {
                    throw new Error(`Broken waypoint, missing data in "${all}"`);
                }

                return {
                    identifier: this.normalizeIdentifier(identifier),
                    type: this.parseNumberOrError(type, all) as XplaneFmsWaypointType,
                    lat: this.parseNumberOrError(lat, all),
                    lon: this.parseNumberOrError(lon, all),
                    elevationFeet: this.parseNumber(elevationFeet, 0),
                };
            })
            .filter((wp) => wp.identifier !== "----");
    }

    private normalizeIdentifier(identifer: string): string {
        const match = identifer.match(/^([+-])([0-9.]+).([+-])([0-9.]+)$/);
        if (!match) {
            return identifer;
        }
        return "W-" + Number(match[2]).toFixed().padStart(3, "0") + Number(match[4]).toFixed().padStart(3, "0");
    }

    private convertWaypointToAerofly(
        waypoint: XplaneFmsWaypoint,
        isFirst: boolean,
        isLast: boolean,
        departureRunway: string | null,
        destinationRunway: string | null,
    ): AeroflyNavRouteBase[] {
        if (isFirst) {
            const route = [
                new AeroflyNavRouteOrigin(waypoint.identifier, waypoint.lon, waypoint.lat, {
                    elevation_ft: waypoint.elevationFeet,
                }),
            ];
            if (departureRunway) {
                route.push(
                    positionRunwayWaypoint(
                        new AeroflyNavRouteDepartureRunway(departureRunway, waypoint.lon, waypoint.lat, {
                            elevation_ft: waypoint.elevationFeet,
                            direction_degree: this.parseRunwayDirection(departureRunway),
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
                    positionRunwayWaypoint(
                        new AeroflyNavRouteDestinationRunway(destinationRunway, waypoint.lon, waypoint.lat, {
                            elevation_ft: waypoint.elevationFeet,
                            direction_degree: this.parseRunwayDirection(destinationRunway),
                        }),
                    ),
                );
            }
            route.push(
                new AeroflyNavRouteDestination(waypoint.identifier, waypoint.lon, waypoint.lat, {
                    elevation_ft: waypoint.elevationFeet,
                }),
            );
            return route;
        }
        return [
            new AeroflyNavRouteWaypoint(waypoint.identifier, waypoint.lon, waypoint.lat, {
                altitude_ft: waypoint.elevationFeet,
            }),
        ];
    }

    private parseRunwayDirection(runway: string): number {
        return this.parseNumber(runway.replace(/^\D+/, ""), 0) * 10;
    }
}
