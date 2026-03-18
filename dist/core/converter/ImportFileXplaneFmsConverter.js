import { AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestination, AeroflyNavRouteDestinationRunway, AeroflyNavRouteOrigin, AeroflyNavRouteWaypoint, } from "@fboes/aerofly-custom-missions";
import { ImportFileXMLConverter } from "./ImportFileConverter.js";
/**
 * Import `.fms` flight plan files from X-Plane 11 / 12
 * @see https://developer.x-plane.com/article/flightplan-files-v11-fms-file-format/
 * @see https://xp-soaring.github.io/tasks/x-plane_fms_format.html
 */
export class ImportFileXplaneFms extends ImportFileXMLConverter {
    convert(content, flightplan) {
        const waypoints = this.getWaypoints(content);
        const departureRunway = this.getRunway(content, "DEPRWY");
        const destinationRunway = this.getRunway(content, "DESRWY");
        flightplan.navigation.waypoints = waypoints.flatMap((waypoint, index) => this.convertWaypointToAerofly(waypoint, index === 0, index === waypoints.length - 1, departureRunway, destinationRunway));
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
        return Array.from(waypointLines).map((m) => ({
            identifier: m[2],
            type: Number(m[1]),
            lat: Number(m[4]),
            lon: Number(m[5]),
            elevationFeet: Number(m[3]),
        }));
    }
    convertWaypointToAerofly(waypoint, isFirst, isLast, departureRunway, destinationRunway) {
        if (isFirst) {
            const route = [
                new AeroflyNavRouteOrigin(waypoint.identifier, waypoint.lon, waypoint.lat, {
                    elevation_ft: waypoint.elevationFeet,
                }),
            ];
            if (departureRunway) {
                route.push(new AeroflyNavRouteDepartureRunway(departureRunway, waypoint.lon, waypoint.lat, {
                    elevation_ft: waypoint.elevationFeet,
                    direction_degree: Number(departureRunway.replace(/^\D+/, "")) * 10,
                }));
            }
            return route;
        }
        if (isLast) {
            const route = [];
            if (destinationRunway) {
                route.push(new AeroflyNavRouteDestinationRunway(destinationRunway, waypoint.lon, waypoint.lat, {
                    elevation_ft: waypoint.elevationFeet,
                    direction_degree: Number(destinationRunway.replace(/^\D+/, "")) * 10,
                }));
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
}
ImportFileXplaneFms.fileExtension = "fms";
