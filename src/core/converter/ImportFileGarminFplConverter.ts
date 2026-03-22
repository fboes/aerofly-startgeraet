import {
  AeroflyFlight,
  AeroflyNavRouteDestination,
  AeroflyNavRouteOrigin,
  AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { ImportFileXMLConverter } from "./ImportFileConverter.js";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";

type GarminFplWaypointType = "AIRPORT" | "USER WAYPOINT" | "NDB" | "VOR" | "INT" | "INT-VRP";

type GaminFplWaypoint = {
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
export class ImportFileGarminFpl extends ImportFileXMLConverter {
  static readonly fileExtension = "fpl";

  convert(content: string, flightplan: AeroflyFlight): void {
    const waypoints = this.getWaypoints(content);

    flightplan.navigation.waypoints = waypoints.map((waypoint, index) =>
      this.convertWaypointToAerofly(waypoint, index === 0, index === waypoints.length - 1),
    );
  }

  private getWaypoints(content: string): GaminFplWaypoint[] {
    const waypointDefinitions = this.getWaypointDefinitions(content);
    const routeTableXml = this.getXmlNode(content, "route");
    const waypointsXml = this.getXmlNodes(routeTableXml, "route-point");

    return waypointsXml.map((xml): GaminFplWaypoint => {
      const waypointDefinition = waypointDefinitions.get(this.getXmlNode(xml, "waypoint-identifier"));
      if (waypointDefinition === undefined) {
        throw new Error("Missing waypoint definition for route point");
      }

      return waypointDefinition;
    });
  }

  private getWaypointDefinitions(content: string): Map<string, GaminFplWaypoint> {
    const waypointDefinitions = new Map<string, GaminFplWaypoint>();
    const waypointTableXml = this.getXmlNode(content, "waypoint-table") || this.getXmlNode(content, "waypoints");
    this.getXmlNodes(waypointTableXml, "waypoint").forEach((xml) => {
      const elevation = this.getXmlNode(xml, "elevation");
      waypointDefinitions.set(this.getXmlNode(xml, "identifier"), {
        identifier: this.getXmlNode(xml, "identifier"),
        type: <GarminFplWaypointType>this.getXmlNode(xml, "type"),
        lat: Number(this.getXmlNode(xml, "lat")),
        lon: Number(this.getXmlNode(xml, "lon")),
        elevationMeter: elevation ? Number(elevation) : undefined,
      });
    });
    return waypointDefinitions;
  }

  private convertWaypointToAerofly(waypoint: GaminFplWaypoint, isFirst: boolean, isLast: boolean): AeroflyNavRouteBase {
    const uid = this.geoToUid(waypoint.lon, waypoint.lat);

    if (isFirst) {
      return new AeroflyNavRouteOrigin(waypoint.identifier, waypoint.lon, waypoint.lat, {
        elevation: waypoint.elevationMeter,
        uid,
      });
    }
    if (isLast) {
      return new AeroflyNavRouteDestination(waypoint.identifier, waypoint.lon, waypoint.lat, {
        elevation: waypoint.elevationMeter,
        uid,
      });
    }
    return new AeroflyNavRouteWaypoint(waypoint.identifier, waypoint.lon, waypoint.lat, {
      uid,
    });
  }
}
