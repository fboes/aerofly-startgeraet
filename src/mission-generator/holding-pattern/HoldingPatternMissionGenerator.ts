import z from "zod";
import type { MissionGenerator } from "../MissionGenerator.interface.js";
import type { MissionGeneratorManifest, MissionGeneratorWaypoint } from "../MissionGenerator.type.js";
import type { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
import { getCardinalDirection, getVectorString } from "../../core/formatter/getVectorString.js";
import { Point, Vector } from "@fboes/geojson";
import { UNIT_METER_PER_FEET, UNIT_METER_PER_NM } from "../../core/util/units.js";
import { randomArbitrary } from "../../core/util/random.js";
import { AeroflyNavigationConfig, AeroflyNavRouteWaypoint } from "@fboes/aerofly-custom-missions";
import { getHoldingPattern, type HoldingPattern } from "./HoldingPattern.js";
import { ErrorFormatted } from "../../core/util/ErrorFormatted.js";
import { numberFormat } from "../../core/formatter/numberFormat.js";
import { getWaypointData, getWaypointFullName } from "../_util/Waypoint.js";

export type HoldingPatternMissionGeneratorConfiguration = {
    navaidIdentifier: z.ZodString;
    distance_nm: z.ZodDefault<z.ZodNumber>;
    holdAltitudeMsl_ft: z.ZodDefault<z.ZodNumber>;
    inboundHeading_deg: z.ZodOptional<z.ZodNumber>;
    dmeDistance_nm: z.ZodDefault<z.ZodNumber>;
    isLeftPattern: z.ZodDefault<z.ZodBoolean>;
    isHoldingAwayPattern: z.ZodDefault<z.ZodBoolean>;
};

export class HoldingPatternMissionGenerator implements MissionGenerator<HoldingPatternMissionGeneratorConfiguration> {
    manifest(): MissionGeneratorManifest {
        return {
            name: "holding-pattern",
            displayName: "Holding Pattern",
            description: "Generates a holding pattern, using the current time, date and weather settings.",
            longDescription: `\
This mission generator will remove the current waypoints from your flightplan,
and will instead add a holding pattern fix as well as a holding pattern flight
plan.

After completing your flight, you will be able to check if you hit the planned
pattern by looking at the recent flight log.

This generator can be used to fly RNAV / VOR holding patterns, as well as
fixes being offset by a DME distance. Be sure to check for the right entry.

The mission generator will make at least one internet request to the
Avaiation Weather Center API, so possibly this could take a few seconds
depending on API availability.
`,
            version: "1.0.0",
        };
    }

    configuration(): z.ZodObject<HoldingPatternMissionGeneratorConfiguration> {
        return z.object({
            navaidIdentifier: z
                .string()
                .regex(/^[A-Za-z0-9]{2,6}$/)
                .uppercase()
                .meta({ title: "Reference RNAV / Navigational Aid" }),
            distance_nm: z.number().min(2).default(8).meta({ title: "Initial aircraft distance from fix", unit: "NM" }),
            holdAltitudeMsl_ft: z
                .number()
                .min(0)
                .default(10000)
                .meta({ title: "Holding Altitude for pattern", unit: "ft MSL" }),
            inboundHeading_deg: z
                .number()
                .min(0)
                .max(360)
                .optional()
                .meta({ title: "Inbound heading for pattern", unit: "°" }),
            dmeDistance_nm: z
                .number()
                .min(0)
                .default(0)
                .meta({ title: "DME distance from Navigational Aid", unit: "NM" }),
            isLeftPattern: z.boolean().default(false).meta({ title: "Use left turn holding pattern" }),
            isHoldingAwayPattern: z
                .boolean()
                .default(false)
                .meta({ title: "Holding course away from the Navigational Aid" }),
        });
    }

    async convert(
        configuration: z.infer<z.ZodObject<HoldingPatternMissionGeneratorConfiguration>>,
        flightPlanService: AeroflyFlightService,
    ): Promise<void> {
        const flight = flightPlanService.getAeroflyFlight();

        // Establish navigational aid / RNAV waypoint
        const navaidData = await getWaypointData(configuration.navaidIdentifier, flight.navigation.waypoints);
        if (!navaidData) {
            throw new ErrorFormatted("Nav aid identifier could not be found: {{ navaidIdentifier }}", {
                navaidIdentifier: configuration.navaidIdentifier,
            });
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

        // Establish pattern
        const aircraft = flightPlanService.getAircraftData();
        const pattern = getHoldingPattern(
            aircraft?.cruiseSpeedKts ?? 999,
            fixData,
            fixPoint,
            inboundHeading,
            configuration,
        );

        // Establish aircraft position
        const aircraftHeading = randomArbitrary(0, 356);
        const aircraftVector = new Vector(configuration.distance_nm * UNIT_METER_PER_NM, (aircraftHeading + 180) % 360);
        const aircraftPoint = fixPoint.getPointBy(aircraftVector);
        aircraftPoint.elevation = configuration.holdAltitudeMsl_ft * UNIT_METER_PER_FEET;

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
            ...this.getPatternWaypoints(pattern),
            arrivalAirport,
        ]);
        flight._missionTitle = `Holding pattern at ${navaidData.identifier}`;
        flight._missionBriefing =
            `\
Your aircraft is ${getVectorString(aircraftVector)} of ${fixData.identifier}.
` + this.getDescription(navaidData, pattern);
    }

    private getPatternWaypoints(pattern: HoldingPattern): AeroflyNavRouteWaypoint[] {
        const fixPoint = pattern.fixPoint;
        const fixData = pattern.fixData;
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
            new AeroflyNavRouteWaypoint(fixData.identifier, fixPoint.longitude, fixPoint.latitude, {
                ...patternWaypointProperties,
                flyOver: true,
                navaidFrequency_khz: fixData.freq_khz,
            }),
            new AeroflyNavRouteWaypoint(
                fixData.identifier + "-TURN",
                pointAfterFix.longitude,
                pointAfterFix.latitude,
                patternWaypointProperties,
            ),
            new AeroflyNavRouteWaypoint(
                fixData.identifier + "-ABEAM",
                pointAbeam.longitude,
                pointAbeam.latitude,
                patternWaypointProperties,
            ),
            new AeroflyNavRouteWaypoint(
                fixData.identifier + "-OUTBND",
                pointOutbound.longitude,
                pointOutbound.latitude,
                patternWaypointProperties,
            ),
            new AeroflyNavRouteWaypoint(
                fixData.identifier + "-INBND",
                pointInbound.longitude,
                pointInbound.latitude,
                patternWaypointProperties,
            ),
            new AeroflyNavRouteWaypoint(fixData.identifier, fixPoint.longitude, fixPoint.latitude, {
                ...patternWaypointProperties,
                flyOver: true,
                navaidFrequency_khz: fixData.freq_khz,
            }),
        ];
    }

    /**
     * @see https://www.code7700.com/holding.htm
     */
    private getDescription(navaidData: MissionGeneratorWaypoint, pattern: HoldingPattern): string {
        const direction = getCardinalDirection(pattern.holdingAreaDirection);
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

        return `Hold ${direction} of ${dmeFix + getWaypointFullName(navaidData)} \
on the ${radial}, \
${dmeInfo}\
${turnInfo}\
maintain ${altitude}'.`;
    }
}
