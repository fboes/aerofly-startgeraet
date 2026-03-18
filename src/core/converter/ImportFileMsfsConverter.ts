import {
  AeroflyFlight,
  AeroflyNavigationConfig,
  AeroflyNavRouteDepartureRunway,
  AeroflyNavRouteDestination,
  AeroflyNavRouteDestinationRunway,
  AeroflyNavRouteOrigin,
  AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { ImportFileXMLConverter } from "./ImportFileConverter.js";
import { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions/types/dto-flight/AeroflyNavRouteBase.js";

//type MsfsPlnWaypointType = "none" | "Airport" | "Intersection" | "VOR" | "NDB" | "User" | "ATC";
type MsfsPlnRunwayDesignator = "NONE" | "CENTER" | "LEFT" | "RIGHT" | "WATER" | "A" | "B";

/**
 * Import `pln` flight plan files from Mcirosoft Flight SImulator 2020 / 2024
 * @see https://docs.flightsimulator.com/html/Content_Configuration/Flights_And_Missions/Flight_Plan_Definitions.htm
 * @see https://docs.flightsimulator.com/msfs2024/html/5_Content_Configuration/Mission_XML_Files/EFB_Flight_Plan_XML_Properties.htm
 */
export class ImportFileMsfs extends ImportFileXMLConverter {
  static readonly fileExtension = "pln";

  convert(content: string, flightplan: AeroflyFlight): void {
    const waypointTableXml = this.getXmlNode(content, "FlightPlan.FlightPlan");

    const versionId = Number(this.getXmlNode(waypointTableXml, "AppVersionMajor"));
    if (versionId <= 0 || versionId > 12) {
      throw Error("Unknown flight plan version ID");
    }

    flightplan.navigation = new AeroflyNavigationConfig(
      Number(this.getXmlNode(waypointTableXml, "CruisingAlt")),
      this.getWaypoints(waypointTableXml),
    );
  }

  private getWaypoints(waypointTableXml: string): AeroflyNavRouteBase[] {
    const waypointsXml = this.getXmlNodes(waypointTableXml, "ATCWaypoint");
    return waypointsXml.flatMap((xml, index): AeroflyNavRouteBase[] => {
      return this.convertWaypointToAerofly(xml, index === 0, index === waypointsXml.length - 1);
    });
  }

  private convertWaypointToAerofly(xml: string, isFirst: boolean, isLast: boolean): AeroflyNavRouteBase[] {
    const coords = this.convertCoordinate(this.getXmlNode(xml, "WorldPosition"));
    const identifier = this.getXmlNode(xml, "ICAOIdent") || this.getXmlAttribute(xml, "id");
    const runway = isFirst || isLast ? this.getRunway(xml) : null;

    if (isFirst) {
      const route = [
        new AeroflyNavRouteOrigin(identifier, coords.lon, coords.lat, {
          elevation_ft: coords.altitude_ft,
        }),
      ];

      if (runway) {
        route.push(
          new AeroflyNavRouteDepartureRunway(runway, coords.lon, coords.lat, {
            elevation_ft: coords.altitude_ft,
            direction_degree: Number(runway.replace(/^\D+/, "")) * 10,
          }),
        );
      }
      return route;
    }
    if (isLast) {
      const route = [];
      if (runway) {
        route.push(
          new AeroflyNavRouteDestinationRunway(runway, coords.lon, coords.lat, {
            elevation_ft: coords.altitude_ft,
            direction_degree: Number(runway.replace(/^\D+/, "")) * 10,
          }),
        );
      }
      route.push(
        new AeroflyNavRouteDestination(identifier, coords.lon, coords.lat, {
          elevation_ft: coords.altitude_ft,
        }),
      );
      return route;
    }
    return [
      new AeroflyNavRouteWaypoint(identifier, coords.lon, coords.lat, {
        altitude_ft: coords.altitude_ft,
      }),
    ];
  }

  private getRunway(xml: string): string | null {
    const runwayNumberFP = this.getXmlNode(xml, "RunwayNumberFP");
    if (!runwayNumberFP) {
      return null;
    }

    const runwayDesignatorFP = this.getXmlNode(xml, "RunwayDesignatorFP") as MsfsPlnRunwayDesignator | "";
    return runwayNumberFP + (runwayDesignatorFP === "NONE" ? "" : runwayDesignatorFP.substring(0, 1));
  }

  private convertCoordinate(coordinate: string): {
    lon: number;
    lat: number;
    altitude_ft: number;
  } {
    // N52° 45' 7.51",W3° 53' 2.16",+002500.00

    const parts = coordinate.split(/,\s*/);
    if (parts.length < 2) {
      throw new Error(
        `Wrong coordinates format "${coordinate}", expexted something like N52° 45' 7.51",W3° 53' 2.16",+002500.00`,
      );
    }
    const numbers = parts.map((p): number => {
      const m = p.match(/([NSEW])(\d+)\D+(\d+)\D+([0-9.]+)/);
      if (m) {
        let b = Number(m[2]); // degree
        b += Number(m[3]) / 60; // minutes
        b += Number(m[4]) / 3600; // seconds
        return m[1] === "S" || m[1] === "W" ? -b : b;
      }
      return 0;
    });

    return {
      lon: numbers[1],
      lat: numbers[0],
      altitude_ft: Number(parts[2] || 0),
    };
  }
}
