import { AeroflyNavigationConfig, AeroflyNavRouteWaypoint } from "@fboes/aerofly-custom-missions";
import { Point, Vector } from "@fboes/geojson";
import type z from "zod";
import { cardinalDirection, asVectorString } from "../../../core/formatter/getVectorString.js";
import { numberFormat } from "../../../core/formatter/numberFormat.js";
import type { AeroflyFlightService } from "../../../core/services/AeroflyFlightService.js";
import { degreeNormalize } from "../../../core/util/degree.js";
import { ErrorDetail } from "../../../core/util/ErrorFormatted.js";
import { randomArbitrary } from "../../../core/util/random.js";
import { UNIT_METER_PER_NM, UNIT_METER_PER_FEET } from "../../../core/util/units.js";
import type { MissionGeneratorWaypoint } from "../../MissionGenerator.type.js";
import { getWaypointData, getWaypointFullName } from "../../util/Waypoint.js";
import { createHoldingPattern, calculateHoldingPatternEntry, type HoldingPattern } from "./HoldingPattern.js";
import type { HoldingPatternMissionGeneratorConfiguration } from "./HoldingPatternMissionGenerator.js";
import { getEntryWaypoints, getPatternWaypoints } from "./HoldingPatternWaypoints.js";

export async function convertScenario(
    configuration: z.infer<z.ZodObject<HoldingPatternMissionGeneratorConfiguration>>,
    flightPlanService: AeroflyFlightService,
): Promise<boolean> {
    const flight = flightPlanService.getAeroflyFlight();

    // Establish navigational aid / RNAV waypoint
    const navaidData = await getWaypointData(configuration.navaidIdentifier, flight.navigation.waypoints);
    if (!navaidData) {
        throw new ErrorDetail("Nav aid identifier could not be found", configuration.navaidIdentifier);
    }
    const navaidPoint = new Point(navaidData.longitude, navaidData.latitude);

    // Establish holding pattern inbound direction
    const inboundHeading = configuration.inboundHeading_deg ?? randomArbitrary(0, 360);

    // Establish fix
    const fixPoint = configuration.dmeDistance_nm
        ? navaidPoint.getPointBy(new Vector(configuration.dmeDistance_nm * UNIT_METER_PER_NM, inboundHeading))
        : navaidPoint;
    const fixData = configuration.dmeDistance_nm
        ? {
              ...navaidData,
              id: `${navaidData.identifier}+${String(configuration.dmeDistance_nm).padStart(2, "0")}`,
          }
        : navaidData;

    // Establish aircraft position
    const aircraftHeading = randomArbitrary(0, 356);
    const aircraftVector = new Vector(
        configuration.distance_nm * UNIT_METER_PER_NM,
        degreeNormalize(aircraftHeading + 180),
    );
    const aircraftPoint = fixPoint.getPointBy(aircraftVector);
    aircraftPoint.elevation = configuration.holdAltitudeMsl_ft * UNIT_METER_PER_FEET;

    // Establish pattern
    const aircraft = flightPlanService.getAircraftData();
    const pattern = createHoldingPattern(
        aircraft?.cruiseSpeedKts ?? 999,
        fixData,
        fixPoint,
        inboundHeading,
        configuration,
    );
    const patternEntry = calculateHoldingPatternEntry(pattern, aircraftVector.bearing);

    // Add flight plan
    const departureAirport = flightPlanService.getFlightplanDepartureAirport();
    const arrivalAirport = flightPlanService.getFlightplanArrivalAirport();
    if (!departureAirport || !arrivalAirport) {
        throw new Error("No valid flight plan found to insert holding pattern into");
    }

    flightPlanService.setFlightPosition(
        aircraftPoint.longitude,
        aircraftPoint.latitude,
        aircraftPoint.elevation,
        aircraftHeading,
        undefined,
        "Cruise",
    );
    flight.navigation = new AeroflyNavigationConfig(aircraftPoint.elevation, [
        departureAirport,
        new AeroflyNavRouteWaypoint("WP-0001", aircraftPoint.longitude, aircraftPoint.latitude, {
            altitude: aircraftPoint.elevation,
        }),
        ...getEntryWaypoints(pattern, configuration.hasEntryWaypoints ? patternEntry : ""),
        ...getPatternWaypoints(pattern),
        arrivalAirport,
    ]);
    flight._missionTitle = `Holding pattern at ${navaidData.identifier}`;
    flight._missionBriefing = getDescription(aircraftVector, navaidData, pattern);

    return true;
}

/**
 * @see https://www.code7700.com/holding.htm
 */
function getDescription(aircraftVector: Vector, navaidData: MissionGeneratorWaypoint, pattern: HoldingPattern): string {
    const direction = cardinalDirection(pattern.holdingAreaDirection);
    const dmeFix = pattern.dmeDistance_nm > 0 ? `the ${pattern.dmeDistance_nm} DME fix, ` : "";
    const radial =
        (navaidData.identifier.length !== 3 ? "inbound course " : "radial ") +
        String(Math.round(pattern.inboundHeading)).padStart(3, "0") +
        "°";
    const dmeInfo =
        pattern.dmeDistanceOutbound_nm !== 0
            ? `${Math.abs(pattern.dmeDistance_nm - pattern.dmeDistanceOutbound_nm)}-mile legs, `
            : "";
    const turnInfo = pattern.isLeftPattern ? "make left-hand turns, " : "make right-hand turns, ";
    const altitude = numberFormat(pattern.holdAltitudeMsl_ft);

    return `\
Your aircraft is ${asVectorString(aircraftVector)} of ${pattern.fixData.identifier}.
Hold ${direction} of ${dmeFix + getWaypointFullName(navaidData)} \
on the ${radial}, \
${dmeInfo}\
${turnInfo}\
maintain ${altitude}'.`;
}
