import type z from "zod";
import { UNIT_METER_PER_NM } from "../../core/util/units.js";
import type { HoldingPatternMissionGeneratorConfiguration } from "./HoldingPatternMissionGenerator.js";
import type { Point } from "@fboes/geojson";
import type { MissionGeneratorWaypoint } from "../MissionGenerator.type.js";

export type HoldingPattern = {
    fixData: MissionGeneratorWaypoint;
    fixPoint: Point;
    inboundHeading: number;
    dmeDistance_nm: number;
    dmeDistanceOutbound_nm: number;
    holdAltitudeMsl_ft: number;
    isHoldingAwayPattern: boolean;
    isLeftPattern: boolean;
    turnRadiusMeters: number;
    holdingAreaDirection: number;
    holdingAreaDirectionTrue: number;
    legDistanceMeters: number;
};

export function getHoldingPattern(
    cruiseSpeedKts: number,
    fixData: MissionGeneratorWaypoint,
    fixPoint: Point,
    inboundHeading: number,
    configuration: z.infer<z.ZodObject<HoldingPatternMissionGeneratorConfiguration>>,
): HoldingPattern {
    const patternSpeedKts = Math.min(cruiseSpeedKts, getMaxPatternSpeedKts(configuration.holdAltitudeMsl_ft));

    const dmeDistanceOutbound_nm =
        configuration.dmeDistance_nm > 0
            ? configuration.dmeDistance_nm + (configuration.isHoldingAwayPattern ? -4 : 4)
            : 0;
    const legTimeMin = configuration.holdAltitudeMsl_ft > 14000 ? 1.5 : 1.0;
    const turnRadiusMeters = getTurnRadiusMeters(patternSpeedKts);
    const holdingAreaDirection = (inboundHeading + (configuration.isHoldingAwayPattern ? 0 : 180)) % 360;
    const holdingAreaDirectionTrue = (holdingAreaDirection + (fixData.mag_dec ?? 0)) % 360;

    return {
        fixData,
        fixPoint,
        inboundHeading,
        dmeDistance_nm: configuration.dmeDistance_nm,
        dmeDistanceOutbound_nm,
        holdingAreaDirection,
        holdAltitudeMsl_ft: configuration.holdAltitudeMsl_ft,
        isHoldingAwayPattern: configuration.isHoldingAwayPattern,
        isLeftPattern: configuration.isLeftPattern,
        turnRadiusMeters,
        holdingAreaDirectionTrue,
        legDistanceMeters: getLegDistanceMeters(
            dmeDistanceOutbound_nm,
            turnRadiusMeters,
            configuration.dmeDistance_nm,
            patternSpeedKts,
            legTimeMin,
        ),
    };
}

/**
 * @see https://skybrary.aero/articles/holding-pattern
 * During entry and holding, pilots manually flying the aircraft are expected
 * to make all turns to achieve an average bank angle of at least 25˚ or
 * a rate of turn of 3˚ per second, whichever requires the lesser bank.
 */
function getTurnRadiusMeters(patternSpeedKts: number): number {
    return (patternSpeedKts / (20 * Math.PI * 3)) * UNIT_METER_PER_NM; // turn radius at 3 degrees per second
    //return (patternSpeedKts ** 2 / (11.26 * Math.tan(25 * (Math.PI / 180)))) * Units.metersPerNauticalMile; // turn radius at 25 degrees bank angle
}

function getLegDistanceMeters(
    dmeDistanceOutbound_nm: number,
    turnRadiusMeters: number,
    dmeDistanceNm: number,
    patternSpeedKts: number,
    legTimeMin: number,
): number {
    if (dmeDistanceOutbound_nm !== 0) {
        return Math.abs(
            Math.sqrt((dmeDistanceOutbound_nm * UNIT_METER_PER_NM) ** 2 - (turnRadiusMeters * 2) ** 2) -
                dmeDistanceNm * UNIT_METER_PER_NM,
        );
    }

    return (patternSpeedKts / 60) * legTimeMin * UNIT_METER_PER_NM;
}

/**
 * @see https://www.code7700.com/holding.htm
 */
function getMaxPatternSpeedKts(patternAltitudeFt: number): number {
    // TODO: Turbulence: 280
    // TODO: Helicopter: patternAltitudeFt <= 6000 ? 100 : 170;

    if (patternAltitudeFt <= 6000) {
        return 200; // FAA
    }
    if (patternAltitudeFt <= 14000) {
        return 230; // ICAO / FAA
    }
    if (patternAltitudeFt <= 20000) {
        return 240; // ICAO
    }
    return 265; // ICAO
}
