import { AeroflyNavigationConfig, AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestination, AeroflyNavRouteDestinationRunway, AeroflyNavRouteOrigin, AeroflyNavRouteWaypoint, } from "@fboes/aerofly-custom-missions";
import { ImportFileXMLConverter } from "./ImportFileConverter.js";
import { AeroflyFlightHelper } from "../util/AeroflyFlightHelper.js";
/**
 * Import `pln` flight plan files from Microsoft Flight Simulator 2020 / 2024
 * @see https://docs.flightsimulator.com/html/Content_Configuration/Flights_And_Missions/Flight_Plan_Definitions.htm
 * @see https://docs.flightsimulator.com/msfs2024/html/5_Content_Configuration/Mission_XML_Files/EFB_Flight_Plan_XML_Properties.htm
 */
export class ImportFileMsfs extends ImportFileXMLConverter {
    static fileExtension = "pln";
    convert(content, flightplan, index = 0) {
        const waypointTableXml = this.getXmlNode(content, "FlightPlan.FlightPlan");
        const versionId = Number(this.getXmlNode(waypointTableXml, "AppVersionMajor"));
        if (versionId <= 0 || versionId > 12) {
            throw Error("Unknown flight plan version ID");
        }
        flightplan.navigation = new AeroflyNavigationConfig(Number(this.getXmlNode(waypointTableXml, "CruisingAlt")), this.getWaypoints(waypointTableXml));
    }
    getWaypoints(waypointTableXml) {
        const waypointsXml = this.getXmlNodes(waypointTableXml, "ATCWaypoint");
        return waypointsXml.flatMap((xml, index) => {
            return this.convertWaypointToAerofly(xml, index === 0, index === waypointsXml.length - 1);
        });
    }
    convertWaypointToAerofly(xml, isFirst, isLast) {
        const coords = this.convertCoordinate(this.getXmlNode(xml, "WorldPosition"));
        const identifier = this.getXmlNode(xml, "ICAOIdent") || this.getXmlAttribute(xml, "id");
        const runway = isFirst || isLast ? this.getRunway(xml) : null;
        const uid = this.geoToUid(coords.lon, coords.lat);
        if (isFirst) {
            const route = [
                new AeroflyNavRouteOrigin(identifier, coords.lon, coords.lat, {
                    elevation_ft: coords.altitude_ft,
                    uid,
                }),
            ];
            if (runway) {
                route.push(AeroflyFlightHelper.positionRunwayWaypoint(new AeroflyNavRouteDepartureRunway(runway, coords.lon, coords.lat, {
                    elevation_ft: coords.altitude_ft,
                    direction_degree: Number(runway.replace(/\D+/, "")) * 10,
                    uid,
                })));
            }
            return route;
        }
        if (isLast) {
            const route = [];
            if (runway) {
                route.push(AeroflyFlightHelper.positionRunwayWaypoint(new AeroflyNavRouteDestinationRunway(runway, coords.lon, coords.lat, {
                    elevation_ft: coords.altitude_ft,
                    direction_degree: Number(runway.replace(/\D+/, "")) * 10,
                    uid,
                })));
            }
            route.push(new AeroflyNavRouteDestination(identifier, coords.lon, coords.lat, {
                elevation_ft: coords.altitude_ft,
                uid,
            }));
            return route;
        }
        return [
            new AeroflyNavRouteWaypoint(identifier, coords.lon, coords.lat, {
                altitude_ft: coords.altitude_ft,
                uid,
            }),
        ];
    }
    getRunway(xml) {
        const runwayNumberFP = this.getXmlNode(xml, "RunwayNumberFP");
        if (!runwayNumberFP) {
            return null;
        }
        const runwayDesignatorFP = this.getXmlNode(xml, "RunwayDesignatorFP");
        return runwayNumberFP + (runwayDesignatorFP === "NONE" ? "" : runwayDesignatorFP.substring(0, 1));
    }
    convertCoordinate(coordinate) {
        // N52° 45' 7.51",W3° 53' 2.16",+002500.00
        const parts = coordinate.split(/,\s*/);
        if (parts.length < 2) {
            throw new Error(`Wrong coordinates format "${coordinate}", expexted something like N52° 45' 7.51",W3° 53' 2.16",+002500.00`);
        }
        const numbers = parts.map((p) => {
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
