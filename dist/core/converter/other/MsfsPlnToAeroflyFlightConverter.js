import { AeroflyNavigationConfig, AeroflyNavRouteDepartureRunway, AeroflyNavRouteDestination, AeroflyNavRouteDestinationRunway, AeroflyNavRouteOrigin, AeroflyNavRouteWaypoint, } from "@fboes/aerofly-custom-missions";
import { StringToAeroflyFlightConverter } from "./StringToAeroflyFlightConverter.js";
import { positionRunwayWaypoint } from "../../util/AeroflyFlightHelper.js";
import { parseXmlAttribute, parseXmlNode, parseXmlNodes } from "../parser/parseXml.js";
/**
 * Import `pln` flight plan files from Microsoft Flight Simulator 2020 / 2024
 * @see https://docs.flightsimulator.com/html/Content_Configuration/Flights_And_Missions/Flight_Plan_Definitions.htm
 * @see https://docs.flightsimulator.com/msfs2024/html/5_Content_Configuration/Mission_XML_Files/EFB_Flight_Plan_XML_Properties.htm
 */
export class MsfsPlnToAeroflyFlightConverter extends StringToAeroflyFlightConverter {
    static fileName = "Microsoft Flight Simulator Flight Plan File";
    static fileExtension = "pln";
    convert(content, flightplan, index = 0) {
        if (index > 0) {
            throw new Error("File format only contains one flight plan");
        }
        const waypointTableXml = parseXmlNode(content, "FlightPlan.FlightPlan");
        const versionId = this.parseNumber(parseXmlNode(waypointTableXml, "AppVersionMajor") || "0", 0);
        if (versionId <= 0 || versionId > 12) {
            throw new Error("Unknown flight plan version ID");
        }
        flightplan.navigation = new AeroflyNavigationConfig(this.parseNumber(parseXmlNode(waypointTableXml, "CruisingAlt"), 0), this.getWaypoints(waypointTableXml));
        flightplan._missionTitle = parseXmlNode(waypointTableXml, "Title");
        flightplan._missionBriefing = parseXmlNode(waypointTableXml, "Descr");
    }
    getWaypoints(waypointTableXml) {
        const waypointsXml = parseXmlNodes(waypointTableXml, "ATCWaypoint");
        return waypointsXml.flatMap((xml, index) => {
            return this.convertWaypointToAerofly(xml, index === 0, index === waypointsXml.length - 1);
        });
    }
    convertWaypointToAerofly(xml, isFirst, isLast) {
        const coords = this.convertCoordinate(parseXmlNode(xml, "WorldPosition"));
        const identifier = parseXmlNode(xml, "ICAOIdent") || parseXmlAttribute(xml, "id");
        const runway = isFirst || isLast ? this.getRunway(xml) : null;
        const runwayDirection = runway ? Number(runway.replace(/\D+/, "")) * 10 : undefined;
        if (isFirst) {
            const route = [
                new AeroflyNavRouteOrigin(identifier, coords.lon, coords.lat, {
                    elevation_ft: coords.altitude_ft,
                }),
            ];
            if (runway && runwayDirection && !isNaN(runwayDirection)) {
                route.push(positionRunwayWaypoint(new AeroflyNavRouteDepartureRunway(runway, coords.lon, coords.lat, {
                    elevation_ft: coords.altitude_ft,
                    direction_degree: runwayDirection,
                })));
            }
            return route;
        }
        if (isLast) {
            const route = [];
            if (runway && runwayDirection && !isNaN(runwayDirection)) {
                route.push(positionRunwayWaypoint(new AeroflyNavRouteDestinationRunway(runway, coords.lon, coords.lat, {
                    elevation_ft: coords.altitude_ft,
                    direction_degree: runwayDirection,
                })));
            }
            route.push(new AeroflyNavRouteDestination(identifier, coords.lon, coords.lat, {
                elevation_ft: coords.altitude_ft,
            }));
            return route;
        }
        return [
            new AeroflyNavRouteWaypoint(identifier, coords.lon, coords.lat, {
                altitude_ft: coords.altitude_ft,
            }),
        ];
    }
    getRunway(xml) {
        const runwayNumberFP = parseXmlNode(xml, "RunwayNumberFP");
        if (!runwayNumberFP) {
            return null;
        }
        const runwayDesignatorFP = parseXmlNode(xml, "RunwayDesignatorFP");
        return runwayNumberFP + (runwayDesignatorFP === "NONE" ? "" : runwayDesignatorFP.substring(0, 1));
    }
    convertCoordinate(coordinate) {
        if (coordinate === "") {
            throw new Error(`Missing coordinates in file. Possibly you are trying to import an Microsoft Flight Simulator 2024 EFB file instead of a mission file.`);
        }
        // N52° 45' 7.51",W3° 53' 2.16",+002500.00
        const parts = coordinate.split(/,\s*/);
        if (parts.length < 2) {
            throw new Error(`Wrong coordinates format "${coordinate}", expected format like "N52° 45' 7.51",W3° 53' 2.16",+002500.00"`);
        }
        const numbers = parts.map((p) => {
            const [, direction, degrees, minutes, seconds] = p.match(/([NSEW])(\d+)\D+(\d+)\D+([0-9.]+)/) || [];
            if (direction && degrees && minutes && seconds) {
                let b = this.parseNumberOrError(degrees, coordinate); // degree
                b += this.parseNumberOrError(minutes, coordinate) / 60; // minutes
                b += this.parseNumberOrError(seconds, coordinate) / 3600; // seconds
                return direction === "S" || direction === "W" ? -b : b;
            }
            return 0;
        });
        const lon = numbers[1];
        const lat = numbers[0];
        if (!lon || !lat || lon < -180 || lon > 180 || lat < -90 || lat > 90) {
            throw new Error(`Wrong coordinates format "${coordinate}", longitude or latitude out of range`);
        }
        return {
            lon,
            lat,
            altitude_ft: this.parseNumberOrError(parts[2] || "0", coordinate),
        };
    }
}
