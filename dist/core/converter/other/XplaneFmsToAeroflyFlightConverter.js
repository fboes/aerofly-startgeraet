import { AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestination, AeroflyNavRouteDestinationRunway, AeroflyNavRouteOrigin, AeroflyNavRouteWaypoint, } from "@fboes/aerofly-custom-missions";
import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
import { positionRunwayWaypoint } from "../../util/AeroflyFlightHelper.js";
/**
 * Import `.fms` flight plan files from X-Plane 11 / 12
 * @see https://developer.x-plane.com/article/flightplan-files-v11-fms-file-format/
 * @see https://xp-soaring.github.io/tasks/x-plane_fms_format.html
 */
export class XplaneFmsToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    static fileName = "X-Plane Flight Plan File";
    static fileExtension = "fms";
    convert(content, flightplan, index = 0) {
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
        flightplan.navigation.waypoints = waypoints.flatMap((waypoint, index) => this.convertWaypointToAerofly(waypoint, index === 0, index === waypoints.length - 1, departureRunway, destinationRunway));
        flightplan._missionTitle = "";
        flightplan._missionBriefing = "";
    }
    getVersion(content) {
        const match = content.match(/\s(\d+) VERSION\s/i);
        if (!match || !match[1]) {
            throw new Error("Missing version information from import file");
        }
        return this.parseNumberOrError(match[1]);
    }
    getRunway(content, type) {
        const match = content.match(new RegExp(`\\s${type} RW(\\S+)`));
        return match ? match[1] : null;
    }
    getWaypoints(content) {
        const waypointLines = content.matchAll(/(?:^|\n)(\d+) (\S+).*? ([0-9.+-]+) ([0-9.+-]+) ([0-9.+-]+)(?:\n|$)/gm);
        if (!waypointLines) {
            throw new Error("No nav lines found");
        }
        return Array.from(waypointLines)
            .map((m) => {
            if (m.length !== 6) {
                throw new Error(`Broken waypoint, expected 6, got ${m.length.toString()} cells`);
            }
            return {
                identifier: this.normalizeIdentifier(m[2]),
                type: this.parseNumberOrError(m[1], m[0].trim()),
                lat: this.parseNumberOrError(m[4], m[0].trim()),
                lon: this.parseNumberOrError(m[5], m[0].trim()),
                elevationFeet: this.parseNumber(m[3], 0),
            };
        })
            .filter((wp) => wp.identifier !== "----");
    }
    normalizeIdentifier(identifer) {
        const match = identifer.match(/^([+-])([0-9.]+).([+-])([0-9.]+)$/);
        if (!match) {
            return identifer;
        }
        return "W-" + Number(match[2]).toFixed().padStart(3, "0") + Number(match[4]).toFixed().padStart(3, "0");
    }
    convertWaypointToAerofly(waypoint, isFirst, isLast, departureRunway, destinationRunway) {
        if (isFirst) {
            const route = [
                new AeroflyNavRouteOrigin(waypoint.identifier, waypoint.lon, waypoint.lat, {
                    elevation_ft: waypoint.elevationFeet,
                }),
            ];
            if (departureRunway) {
                route.push(positionRunwayWaypoint(new AeroflyNavRouteDepartureRunway(departureRunway, waypoint.lon, waypoint.lat, {
                    elevation_ft: waypoint.elevationFeet,
                    direction_degree: this.parseRunwayDirection(departureRunway),
                })));
            }
            return route;
        }
        if (isLast) {
            const route = [];
            if (destinationRunway) {
                route.push(positionRunwayWaypoint(new AeroflyNavRouteDestinationRunway(destinationRunway, waypoint.lon, waypoint.lat, {
                    elevation_ft: waypoint.elevationFeet,
                    direction_degree: this.parseRunwayDirection(destinationRunway),
                })));
            }
            route.push(new AeroflyNavRouteDestination(waypoint.identifier, waypoint.lon, waypoint.lat, {
                elevation_ft: waypoint.elevationFeet,
            }));
            return route;
        }
        return [
            new AeroflyNavRouteWaypoint(waypoint.identifier, waypoint.lon, waypoint.lat, {
                altitude_ft: waypoint.elevationFeet,
            }),
        ];
    }
    parseRunwayDirection(runway) {
        return this.parseNumber(runway.replace(/^\D+/, ""), 0) * 10;
    }
}
