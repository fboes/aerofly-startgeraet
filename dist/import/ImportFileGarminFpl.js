import { AeroflyNavRouteDestination, AeroflyNavRouteOrigin, AeroflyNavRouteWaypoint, } from "@fboes/aerofly-custom-missions";
import { ImportFileXMLHandler } from "./ImportFileHandler.js";
/**
 * Import `fpl` Gamin FPL files
 * @see https://www8.garmin.com/xmlschemas/FlightPlanv1.xsd
 */
export class ImportFileGarminFpl extends ImportFileXMLHandler {
    convert(content, flightplan) {
        const waypoints = this.getWaypoints(content);
        flightplan.navigation.waypoints = waypoints.map((waypoint, index) => this.convertWaypointToAerofly(waypoint, index === 0, index === waypoints.length - 1));
    }
    getWaypoints(content) {
        const waypointDefinitions = this.getWaypointDefinitions(content);
        const routeTableXml = this.getXmlNode(content, "route");
        const waypointsXml = this.getXmlNodes(routeTableXml, "route-point");
        return waypointsXml.map((xml) => {
            const waypointDefinition = waypointDefinitions.get(this.getXmlNode(xml, "waypoint-identifier"));
            if (waypointDefinition === undefined) {
                throw new Error("Missing waypoint definition for route point");
            }
            return waypointDefinition;
        });
    }
    getWaypointDefinitions(content) {
        const waypointDefinitions = new Map();
        const waypointTableXml = this.getXmlNode(content, "waypoint-table") || this.getXmlNode(content, "waypoints");
        this.getXmlNodes(waypointTableXml, "waypoint").forEach((xml) => {
            const elevation = this.getXmlNode(xml, "elevation");
            waypointDefinitions.set(this.getXmlNode(xml, "identifier"), {
                identifier: this.getXmlNode(xml, "identifier"),
                type: this.getXmlNode(xml, "type"),
                lat: Number(this.getXmlNode(xml, "lat")),
                lon: Number(this.getXmlNode(xml, "lon")),
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
ImportFileGarminFpl.fileExtension = "fpl";
