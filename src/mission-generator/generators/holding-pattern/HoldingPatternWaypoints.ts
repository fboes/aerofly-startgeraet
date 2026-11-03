import { AeroflyNavRouteWaypoint } from "@fboes/aerofly-custom-missions";
import { Vector } from "@fboes/geojson";
import { degreeNormalize } from "../../../core/util/degree.js";
import type { HoldingPattern, HoldingPatternEntry } from "./HoldingPattern.js";

/**
 * @see https://www.code7700.com/holding.htm
 * @returns the actual waypoints which make up a complete holding pattern round
 *   trip:
 *   - Initial fix
 *   - reference point for first turn
 *   - end point abeam of fix
 *   - reference point for second turn
 *   - end point to fly inbound to fix again
 */
export function getPatternWaypoints(pattern: HoldingPattern): AeroflyNavRouteWaypoint[] {
    const fixPoint = pattern.fixPoint;
    const fixLocation = pattern.fixLocation;
    const turnMultiplier = pattern.isLeftPattern ? -1 : 1;

    const pointAfterFix = fixPoint.getPointBy(
        new Vector(pattern.turnRadiusMeters, pattern.holdingAreaDirectionTrue + 180),
    );
    const pointAbeam = pointAfterFix.getPointBy(
        new Vector(2 * pattern.turnRadiusMeters, pattern.holdingAreaDirectionTrue - turnMultiplier * 90),
    );
    const pointOutbound = pointAbeam.getPointBy(
        new Vector(pattern.legDistanceMeters + 2 * pattern.turnRadiusMeters, pattern.holdingAreaDirectionTrue),
    );
    const pointInbound = pointOutbound.getPointBy(
        new Vector(2 * pattern.turnRadiusMeters, pattern.holdingAreaDirectionTrue + turnMultiplier * 90),
    );

    const patternWaypointProperties = {
        altitude_ft: pattern.holdAltitudeMsl_ft,
    };

    return [
        new AeroflyNavRouteWaypoint(fixLocation.identifier, fixPoint.longitude, fixPoint.latitude, {
            ...patternWaypointProperties,
            flyOver: true,
            navaidFrequency_khz: fixLocation.freq_khz,
        }),
        new AeroflyNavRouteWaypoint(
            fixLocation.identifier + "-TURN",
            pointAfterFix.longitude,
            pointAfterFix.latitude,
            patternWaypointProperties,
        ),
        new AeroflyNavRouteWaypoint(
            fixLocation.identifier + "-ABEAM",
            pointAbeam.longitude,
            pointAbeam.latitude,
            patternWaypointProperties,
        ),
        new AeroflyNavRouteWaypoint(
            fixLocation.identifier + "-OUTBND",
            pointOutbound.longitude,
            pointOutbound.latitude,
            patternWaypointProperties,
        ),
        new AeroflyNavRouteWaypoint(
            fixLocation.identifier + "-INBND",
            pointInbound.longitude,
            pointInbound.latitude,
            patternWaypointProperties,
        ),
        new AeroflyNavRouteWaypoint(fixLocation.identifier, fixPoint.longitude, fixPoint.latitude, {
            ...patternWaypointProperties,
            flyOver: true,
            navaidFrequency_khz: fixLocation.freq_khz,
        }),
    ];
}

/**
 * @param patternEntry if empty, will do a simplified (incorrect) pattern entry
 * @see https://www.code7700.com/holding.htm
 * @returns additional waypoints to enter the holding pattern, depending on
 *   pattern entry method.
 */
export function getEntryWaypoints(
    pattern: HoldingPattern,
    patternEntry: HoldingPatternEntry | "",
): AeroflyNavRouteWaypoint[] {
    switch (patternEntry) {
        case "":
            return getSimpleEntryWaypoint(pattern);
        case "parallel":
            return getParallelEntryWaypoints(pattern);
        case "offset":
            return getOffsetEntryWaypoints(pattern);
        default:
            return [];
    }
}

/**
 * @returns a simplified (incorrect) pattern entry
 */
function getSimpleEntryWaypoint(pattern: HoldingPattern): AeroflyNavRouteWaypoint[] {
    const patternWaypointProperties = {
        altitude_ft: pattern.holdAltitudeMsl_ft,
    };
    const pointInbound = pattern.fixPoint.getPointBy(
        new Vector(pattern.turnRadiusMeters, degreeNormalize(pattern.holdingAreaDirectionTrue)),
    );

    return [
        new AeroflyNavRouteWaypoint(
            pattern.fixLocation.identifier + "-ENTRY",
            pointInbound.longitude,
            pointInbound.latitude,
            patternWaypointProperties,
        ),
    ];
}

/**
 * @returns a parallel entry
 *   - Pass close by the fix
 *   - fly parallel to inbound leg, but in the opposite direction
 *   - turn into the holding pattern circle
 *   - fly to the initial fix
 */
function getParallelEntryWaypoints(pattern: HoldingPattern): AeroflyNavRouteWaypoint[] {
    const turnMultiplier = pattern.isLeftPattern ? -1 : 1;
    const entryLegDistance = pattern.legDistanceMeters + pattern.turnRadiusMeters;
    const patternWaypointProperties = {
        altitude_ft: pattern.holdAltitudeMsl_ft,
    };

    const pointAlmostFix = pattern.fixPoint.getPointBy(
        new Vector(100, degreeNormalize(pattern.holdingAreaDirectionTrue + turnMultiplier * 90)),
    );
    const pointTurnOutbound = pointAlmostFix.getPointBy(
        new Vector(entryLegDistance, degreeNormalize(pattern.holdingAreaDirectionTrue)),
    );
    const pointTurnInbound = pointAlmostFix.getPointBy(
        new Vector(entryLegDistance, degreeNormalize(pattern.holdingAreaDirectionTrue + turnMultiplier * -30)),
    );
    const pointInbound = pattern.fixPoint.getPointBy(
        new Vector(pattern.turnRadiusMeters, degreeNormalize(pattern.holdingAreaDirectionTrue)),
    );

    return [
        new AeroflyNavRouteWaypoint(
            pattern.fixLocation.identifier + "-PRL0",
            pointAlmostFix.longitude,
            pointAlmostFix.latitude,
            {
                ...patternWaypointProperties,
                navaidFrequency_khz: pattern.fixLocation.freq_khz,
            },
        ),
        new AeroflyNavRouteWaypoint(
            pattern.fixLocation.identifier + "-PRL1",
            pointTurnOutbound.longitude,
            pointTurnOutbound.latitude,
            patternWaypointProperties,
        ),
        new AeroflyNavRouteWaypoint(
            pattern.fixLocation.identifier + "-PRL2",
            pointTurnInbound.longitude,
            pointTurnInbound.latitude,
            patternWaypointProperties,
        ),
        new AeroflyNavRouteWaypoint(
            pattern.fixLocation.identifier + "-PRL3",
            pointInbound.longitude,
            pointInbound.latitude,
            patternWaypointProperties,
        ),
    ];
}

/**
 * @returns an offset / teardrop entry
 *   - Pass the pattern fix
 *   - Fly into the holding pattern circle
 *   - Turn onto the inbound leg
 */
function getOffsetEntryWaypoints(pattern: HoldingPattern): AeroflyNavRouteWaypoint[] {
    const turnMultiplier = pattern.isLeftPattern ? -1 : 1;
    const entryLegDistance = pattern.legDistanceMeters + pattern.turnRadiusMeters;
    const patternWaypointProperties = {
        altitude_ft: pattern.holdAltitudeMsl_ft,
    };

    const pointAfterFix = pattern.fixPoint.getPointBy(
        new Vector(entryLegDistance, degreeNormalize(pattern.holdingAreaDirectionTrue + turnMultiplier * -30)),
    );
    const pointInbound = pattern.fixPoint.getPointBy(
        new Vector(entryLegDistance, degreeNormalize(pattern.holdingAreaDirectionTrue)),
    );

    return [
        new AeroflyNavRouteWaypoint(
            pattern.fixLocation.identifier,
            pattern.fixPoint.longitude,
            pattern.fixPoint.latitude,
            {
                ...patternWaypointProperties,
                navaidFrequency_khz: pattern.fixLocation.freq_khz,
                flyOver: true,
            },
        ),
        new AeroflyNavRouteWaypoint(
            pattern.fixLocation.identifier + "-OFF1",
            pointAfterFix.longitude,
            pointAfterFix.latitude,
            patternWaypointProperties,
        ),
        new AeroflyNavRouteWaypoint(
            pattern.fixLocation.identifier + "-OFF2",
            pointInbound.longitude,
            pointInbound.latitude,
            patternWaypointProperties,
        ),
    ];
}
