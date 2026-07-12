import { AeroflyNavRouteDestination, AeroflyNavRouteOrigin, AeroflyNavRouteWaypoint, } from "@fboes/aerofly-custom-missions";
import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
import { parseXmlNode, parseXmlNodes } from "../parser/parseXml.js";
/**
 * Import `fpl` Gamin FPL files
 * @see https://www8.garmin.com/xmlschemas/FlightPlanv1.xsd
 */
export class GarminFplToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    static fileName = "Garmin Flight Plan File";
    static fileExtension = "fpl";
    getIndices(content) {
        return this.getRoutes(content).map((r, i) => parseXmlNode(r, "route-name") || `Route ${i + 1}`);
    }
    convert(content, flightplan, index = 0) {
        const routes = this.getRoutes(content);
        const route = routes.at(index);
        if (route === undefined) {
            throw new Error("Route index does not exist");
        }
        const waypoints = this.getWaypoints(content, route);
        flightplan.navigation.waypoints = waypoints.map((waypoint, index) => this.convertWaypointToAerofly(waypoint, index === 0, index === waypoints.length - 1));
        flightplan._missionTitle = parseXmlNode(route, "route-name");
        flightplan._missionBriefing = parseXmlNode(route, "route-description");
    }
    getRoutes(content) {
        return parseXmlNodes(content, "route");
    }
    getWaypoints(content, routeTableXml) {
        const waypointDefinitions = this.getWaypointDefinitions(content);
        const waypointsXml = parseXmlNodes(routeTableXml, "route-point");
        return waypointsXml.map((xml) => {
            const waypointDefinition = waypointDefinitions.get(parseXmlNode(xml, "waypoint-identifier"));
            if (waypointDefinition === undefined) {
                throw new Error("Missing waypoint definition for route point");
            }
            return waypointDefinition;
        });
    }
    getWaypointDefinitions(content) {
        const waypointDefinitions = new Map();
        const waypointTableXml = parseXmlNode(content, "waypoint-table") || parseXmlNode(content, "waypoints");
        parseXmlNodes(waypointTableXml, "waypoint").forEach((xml) => {
            const elevation = parseXmlNode(xml, "elevation");
            waypointDefinitions.set(parseXmlNode(xml, "identifier"), {
                identifier: parseXmlNode(xml, "identifier"),
                type: parseXmlNode(xml, "type"),
                lat: Number(parseXmlNode(xml, "lat")),
                lon: Number(parseXmlNode(xml, "lon")),
                elevationMeter: elevation ? Number(elevation) : undefined,
            });
        });
        return waypointDefinitions;
    }
    convertWaypointToAerofly(waypoint, isFirst, isLast) {
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
