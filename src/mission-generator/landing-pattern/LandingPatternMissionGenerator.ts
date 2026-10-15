import z from "zod";
import type { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
import type { MissionGenerator } from "../MissionGenerator.interface.js";
import type { MissionGeneratorManifest } from "../MissionGenerator.type.js";
import { Point, Vector } from "@fboes/geojson";
import { UNIT_METER_PER_FEET, UNIT_METER_PER_NM } from "../../core/util/units.js";
import { randomArbitrary } from "../../core/util/random.js";
import type { BestRunway } from "../../core/api/AviationWeatherAeroflyApi.js";
import {
    AeroflyNavigationConfig,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { getVectorString } from "../../core/formatter/getVectorString.js";
import {
    getAirportDataViaOrigin,
    getBestRunwayViaFlightService,
    getMinimumSafeAltitude,
    getRunwayPoint,
} from "../missionGeneratorUtils.js";

type LandingPatternMissionGeneratorConfiguration = {
    distance_nm: z.ZodDefault<z.ZodNumber>;
    patternAltitudeAgl_ft: z.ZodDefault<z.ZodNumber>;
    minimumSafeAltitude_ft: z.ZodOptional<z.ZodNumber>;
    rightPatternRunways: z.ZodOptional<z.ZodString>;
};

export class LandingPatternMissionGenerator implements MissionGenerator<LandingPatternMissionGeneratorConfiguration> {
    readonly patternDistance_Nm = 1;
    readonly patternFinalDistance_Nm = 1;

    manifest(): MissionGeneratorManifest {
        return {
            name: "landing-pattern",
            displayName: "Landing Pattern",
            description: "Generates a landing pattern, using the current origin, time, date and weather settings.",
            longDescription: `\
This mission generator will create a civil landing pattern flightplan at your
current origin airport, using the current weather settings to determine which
runway to use.

After completing your flight, you will be able to check if you hit the planned
pattern by looking at the recent flight log.

Your aircraft will be placed at a random location in the vicinity.
The generator will create a landing pattern at this altitude above ground level.
If in doubt, provide a minimum safe altitude to not have your aircraft spawn in terrain.
Right-hand patterns will be assumed for all runways ending with "R". You can
provide an additional list of right-hand pattern runways.

The mission generator will make at least one API call to an internet service,
so possibly this could take a few seconds depending on API availability.
`,
            version: "1.0.0",
        };
    }

    configuration(): z.ZodObject<LandingPatternMissionGeneratorConfiguration> {
        return z.object({
            distance_nm: z
                .number()
                .min(2)
                .default(8)
                .meta({ title: "Initial aircraft distance from airport", unit: "NM" }),
            patternAltitudeAgl_ft: z
                .number()
                .min(100)
                .default(1000)
                .meta({ title: "Pattern altitude", unit: "ft AGL" }),
            minimumSafeAltitude_ft: z.number().optional().meta({ title: "Minimum safe altitude", unit: "ft MSL" }),
            rightPatternRunways: z
                .string()
                .optional()
                .meta({ title: "Comma-separated list of runway names with right-turn pattern" }),
        });
    }

    async convert(
        configuration: z.infer<z.ZodObject<LandingPatternMissionGeneratorConfiguration>>,
        flightPlanService: AeroflyFlightService,
    ): Promise<void> {
        const rightPatternRunways = (configuration.rightPatternRunways ?? "").toUpperCase().split(/\s*,\s/);

        // Establish airport
        const airportData = await getAirportDataViaOrigin(flightPlanService);
        const airportPoint = new Point(airportData.lon, airportData.lat, airportData.elev);

        // Establish aircraft position
        const aircraftHeading = randomArbitrary(0, 356);
        const aircraftVector = new Vector(configuration.distance_nm * UNIT_METER_PER_NM, (aircraftHeading + 180) % 360);
        const aircraftPoint = airportPoint.getPointBy(aircraftVector);
        aircraftPoint.elevation = Math.min(
            await getMinimumSafeAltitude(aircraftPoint, configuration.minimumSafeAltitude_ft),
            airportData.elev + (configuration.patternAltitudeAgl_ft + 500) * UNIT_METER_PER_FEET,
        );

        // Establish runway
        const runwayData = await getBestRunwayViaFlightService(airportData, flightPlanService);
        if (rightPatternRunways) {
            runwayData.isRight = rightPatternRunways.includes(runwayData.id);
        }
        const runwayPoint = getRunwayPoint(runwayData, airportPoint);

        // Add flight plan
        flightPlanService.setFlightPosition(
            aircraftPoint.longitude,
            aircraftPoint.latitude,
            aircraftPoint.elevation,
            aircraftHeading,
            undefined,
            "Cruise",
        );
        const flight = flightPlanService.getAeroflyFlight();
        flight.navigation = new AeroflyNavigationConfig(aircraftPoint.elevation, [
            new AeroflyNavRouteOrigin(airportData.icaoId, airportData.lon, airportData.lat, {
                elevation: airportData.elev,
            }),
            new AeroflyNavRouteDepartureRunway(runwayData.id, runwayPoint.longitude, runwayPoint.latitude, {
                elevation: runwayPoint.elevation,
                direction_degree: runwayData.alignment,
            }),
            ...this.getPatternWaypoints(runwayData, runwayPoint, configuration.patternAltitudeAgl_ft),
            new AeroflyNavRouteDestinationRunway(runwayData.id, runwayPoint.longitude, runwayPoint.latitude, {
                elevation: runwayPoint.elevation,
                direction_degree: runwayData.alignment,
            }),
            new AeroflyNavRouteDestination(airportData.icaoId, airportData.lon, airportData.lat, {
                elevation: airportData.elev,
            }),
        ]);
        flight._missionTitle = `Landing pattern entry at ${airportData.name}`;
        flight._missionBriefing = `\
Your aircraft is ${getVectorString(aircraftVector)} of ${airportData.name} Airport. You will have to make a correct ${runwayData.isRight ? "right-hand" : "left-hand"} landing pattern entry for runway ${runwayData.id}, and land safely.
`;
    }

    private getPatternWaypoints(
        runwayData: BestRunway,
        runwayPoint: Point,
        patternAltitudeAgl_ft: number,
    ): AeroflyNavRouteWaypoint[] {
        /**
         * in meters
         */
        const exitDistance: number = this.patternDistance_Nm * UNIT_METER_PER_NM;

        /**
         * in meters
         */
        const downwindDistance: number = this.patternDistance_Nm * UNIT_METER_PER_NM;

        /**
         * in meters
         */
        const finalDistance: number = this.patternFinalDistance_Nm * UNIT_METER_PER_NM;

        /**
         * in degree
         */
        const patternOrientation: number = runwayData.alignment + (runwayData.isRight ? 90 : 270);

        /**
         * in meters MSL
         */
        const patternAltitude = (runwayPoint.elevation ?? 0) + patternAltitudeAgl_ft * UNIT_METER_PER_FEET;

        /**
         * meters to sink per meter distance to have 3° glide slope
         */
        const glideSlope: number = (319.8 * UNIT_METER_PER_FEET) / UNIT_METER_PER_NM;

        // Final
        const activeRunwayFinal = runwayPoint.getPointBy(new Vector(finalDistance, runwayData.alignment + 180));
        const finalAltitude = (runwayPoint.elevation ?? 0) + finalDistance * glideSlope;
        activeRunwayFinal.elevation = Math.min(finalAltitude, patternAltitude);

        // Base
        const activeRunwayBase = activeRunwayFinal.getPointBy(new Vector(downwindDistance, patternOrientation));
        const baseAltitude = finalAltitude + downwindDistance * glideSlope;
        activeRunwayBase.elevation = Math.min(baseAltitude, patternAltitude);

        // Crosswind
        const activeRunwayCrosswind = runwayPoint.getPointBy(
            new Vector(runwayData.dimension.length * UNIT_METER_PER_FEET + exitDistance, runwayData.alignment),
        );
        activeRunwayCrosswind.elevation = patternAltitude;

        // Downwind
        const activeRunwayDownwind = activeRunwayCrosswind.getPointBy(new Vector(downwindDistance, patternOrientation));
        activeRunwayDownwind.elevation = patternAltitude;

        // Entry
        const activeRunwayEntry = activeRunwayDownwind.getPointBy(
            new Vector(finalDistance, runwayData.alignment + 180),
        );
        activeRunwayEntry.elevation = patternAltitude;

        return [
            new AeroflyNavRouteWaypoint(
                runwayData.id + "-CROSS",
                activeRunwayCrosswind.longitude,
                activeRunwayCrosswind.latitude,
                {
                    altitude: activeRunwayCrosswind.elevation,
                },
            ),
            new AeroflyNavRouteWaypoint(
                runwayData.id + "-DOWN",
                activeRunwayDownwind.longitude,
                activeRunwayDownwind.latitude,
                {
                    altitude: activeRunwayDownwind.elevation,
                },
            ),
            new AeroflyNavRouteWaypoint(
                runwayData.id + "-ENTRY",
                activeRunwayEntry.longitude,
                activeRunwayEntry.latitude,
                {
                    altitude: activeRunwayEntry.elevation,
                },
            ),
            new AeroflyNavRouteWaypoint(
                runwayData.id + "-BASE",
                activeRunwayBase.longitude,
                activeRunwayBase.latitude,
                {
                    altitude: activeRunwayBase.elevation,
                },
            ),
            new AeroflyNavRouteWaypoint(
                runwayData.id + "-FINAL",
                activeRunwayFinal.longitude,
                activeRunwayFinal.latitude,
                {
                    altitude: activeRunwayFinal.elevation,
                },
            ),
        ];
    }
}
