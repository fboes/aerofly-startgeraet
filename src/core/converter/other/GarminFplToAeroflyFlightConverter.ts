import {
    type AeroflyFlight,
    type AeroflyNavRouteBase,
    AeroflyNavRouteDestination,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
import { parseXmlNode, parseXmlNodes } from "../parser/parseXml.js";

type GarminFplWaypointType = "AIRPORT" | "USER WAYPOINT" | "NDB" | "VOR" | "INT" | "INT-VRP";

type GarminFplWaypoint = {
    identifier: string;
    type: GarminFplWaypointType;
    lat: number;
    lon: number;
    elevationMeter?: number;
};

/**
 * Import `fpl` Gamin FPL files
 * @see https://www8.garmin.com/xmlschemas/FlightPlanv1.xsd
 */
export class GarminFplToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    static readonly fileName = "Garmin Flight Plan File";
    static readonly fileExtension = "fpl";

    getIndices(content: string): string[] {
        return this.getRoutes(content).map((r, i) => parseXmlNode(r, "route-name") || `Route ${i + 1}`);
    }

    convert(content: string, flightplan: AeroflyFlight, index = 0): void {
        const routes = this.getRoutes(content);
        const route = routes.at(index);
        if (route === undefined) {
            throw new Error("Route index does not exist");
        }
        const waypoints = this.getWaypoints(content, route);

        flightplan.navigation.waypoints = waypoints.map((waypoint, index) =>
            this.convertWaypointToAerofly(waypoint, index === 0, index === waypoints.length - 1),
        );
        flightplan._missionTitle = parseXmlNode(route, "route-name");
        flightplan._missionBriefing = parseXmlNode(route, "route-description");
    }

    private getRoutes(content: string): string[] {
        return parseXmlNodes(content, "route");
    }

    private getWaypoints(content: string, routeTableXml: string): GarminFplWaypoint[] {
        const waypointDefinitions = this.getWaypointDefinitions(content);
        const waypointsXml = parseXmlNodes(routeTableXml, "route-point");

        return waypointsXml.map((xml): GarminFplWaypoint => {
            const waypointDefinition = waypointDefinitions.get(parseXmlNode(xml, "waypoint-identifier"));
            if (waypointDefinition === undefined) {
                throw new Error("Missing waypoint definition for route point");
            }

            return waypointDefinition;
        });
    }

    private getWaypointDefinitions(content: string): Map<string, GarminFplWaypoint> {
        const waypointDefinitions = new Map<string, GarminFplWaypoint>();
        const waypointTableXml = parseXmlNode(content, "waypoint-table") || parseXmlNode(content, "waypoints");
        parseXmlNodes(waypointTableXml, "waypoint").forEach((xml) => {
            const elevation = parseXmlNode(xml, "elevation");
            waypointDefinitions.set(parseXmlNode(xml, "identifier"), {
                identifier: parseXmlNode(xml, "identifier"),
                type: <GarminFplWaypointType>parseXmlNode(xml, "type"),
                lat: this.parseNumberOrError(parseXmlNode(xml, "lat"), xml),
                lon: this.parseNumberOrError(parseXmlNode(xml, "lon"), xml),
                elevationMeter: elevation ? this.parseNumberOrError(elevation, xml) : undefined,
            });
        });
        return waypointDefinitions;
    }

    private convertWaypointToAerofly(
        waypoint: GarminFplWaypoint,
        isFirst: boolean,
        isLast: boolean,
    ): AeroflyNavRouteBase {
        if (isFirst) {
            return new AeroflyNavRouteOrigin(waypoint.identifier, waypoint.lon, waypoint.lat, {
                elevation: waypoint.elevationMeter,
            });
        }
        if (isLast) {
            return new AeroflyNavRouteDestination(waypoint.identifier, waypoint.lon, waypoint.lat, {
                elevation: waypoint.elevationMeter,
            });
        }
        return new AeroflyNavRouteWaypoint(waypoint.identifier, waypoint.lon, waypoint.lat);
    }
}
