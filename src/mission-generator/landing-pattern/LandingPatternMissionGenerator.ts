import z from "zod";
import type { AeroflyFlightService } from "../../core/services/AeroflyFlightService.js";
import type { MissionGenerator, MissionGeneratorManifest } from "../MissionGenerator.interface.js";
import { Point, Vector } from "@fboes/geojson";
import { UNIT_METER_PER_FEET, UNIT_METER_PER_NM } from "../../core/util/units.js";
import { randomArbitrary } from "../../core/util/random.js";
import { getAirportCached, getBestRunway, type BestRunway } from "../../core/api/AviationWeatherAeroflyApi.js";
import {
    AeroflyNavigationConfig,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";

type LandingPatternMissionGeneratorConfiguration = {
    distance_nm: z.ZodDefault<z.ZodNumber>;
    initialAltAgl_ft: z.ZodDefault<z.ZodNumber>;
    rightPatternRunways: z.ZodOptional<z.ZodString>;
};

export class LandingPatternMissionGenerator implements MissionGenerator<LandingPatternMissionGeneratorConfiguration> {
    readonly patternDistance_Nm = 1;
    readonly patternFinalDistance_Nm = 1;
    readonly patternAltitudeAgl_ft = 1000;

    manifest(): MissionGeneratorManifest {
        return {
            name: "landing-pattern",
            displayName: "Landing Pattern",
            description: "Generates a landing pattern, using the current destination, time, date and weather settings.",
            version: "1.0.0",
        };
    }

    configuration(): z.ZodObject<LandingPatternMissionGeneratorConfiguration> {
        return z.object({
            distance_nm: z
                .number()
                .min(1)
                .default(8)
                .describe("Initial aircraft distance from airport in Nautical Miles"),
            initialAltAgl_ft: z.number().min(100).default(1000).describe("Pattern altitude in ft AGL"),
            rightPatternRunways: z
                .string()
                .optional()
                .describe("Comma-separated list of runway names with right-turn pattern"),
        });
    }

    async convert(
        configuration: z.infer<z.ZodObject<LandingPatternMissionGeneratorConfiguration>>,
        flightPlanService: AeroflyFlightService,
    ): Promise<void> {
        const rightPatternRunways = (configuration.rightPatternRunways ?? "").toUpperCase().split(/\s*,\s/);

        const origin = flightPlanService.getFlightplanDepartureAirport();
        if (!origin) {
            throw new Error("Please provide an initial airport");
        }

        // Establish airport
        const airportData = await getAirportCached(origin.identifier);
        const airportPoint = new Point(airportData.lon, airportData.lat, airportData.elev);

        // Establish aircraft position
        const aircraftHeading = randomArbitrary(0, 356);
        const aircraftPoint = airportPoint.getPointBy(
            new Vector(configuration.distance_nm * UNIT_METER_PER_NM, (aircraftHeading + 180) % 360),
        );
        aircraftPoint.elevation = airportData.elev + configuration.initialAltAgl_ft / UNIT_METER_PER_FEET;

        // Establish runway
        const runwayData = await getBestRunway(
            origin.identifier,
            flightPlanService.getWindDirection(),
            flightPlanService.getWindSpeed(),
        );
        if (rightPatternRunways) {
            runwayData.isRight = rightPatternRunways.includes(runwayData.id);
        }
        const runwayPoint = airportPoint.getPointBy(
            new Vector(runwayData.dimension.length * UNIT_METER_PER_FEET, runwayData.alignment),
        );

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
            new AeroflyNavRouteOrigin(origin.identifier, airportData.lon, airportData.lat, {
                elevation: airportData.elev,
            }),
            new AeroflyNavRouteDepartureRunway(runwayData.id, runwayPoint.longitude, runwayPoint.latitude, {
                elevation: runwayPoint.elevation,
                direction_degree: runwayData.alignment,
            }),
            ...this.getPatternWaypoints(runwayData, runwayPoint),
            new AeroflyNavRouteDestinationRunway(runwayData.id, runwayPoint.longitude, runwayPoint.latitude, {
                elevation: runwayPoint.elevation,
                direction_degree: runwayData.alignment,
            }),
            new AeroflyNavRouteDestination(origin.identifier, airportData.lon, airportData.lat, {
                elevation: airportData.elev,
            }),
        ]);
        flight._missionTitle = `Landing pattern entry at ${airportData.name}`;
        flight._missionBriefing = `\
Your aircraft is ${configuration.distance_nm.toString()} NM away from ${airportData.name} Airport. You will have to make a correct ${runwayData.isRight ? "right-hand" : "left-hand"} landing pattern entry for runway ${runwayData.alignment}, and land safely.
`;
    }

    private getPatternWaypoints(runwayData: BestRunway, runwayPoint: Point): AeroflyNavRouteWaypoint[] {
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
        const patternAltitude = (runwayPoint.elevation ?? 0) + this.patternAltitudeAgl_ft / UNIT_METER_PER_FEET;

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
        const activeRunwayEntry = runwayPoint.getPointBy(new Vector(downwindDistance, patternOrientation));
        activeRunwayEntry.elevation = patternAltitude;

        return [
            new AeroflyNavRouteWaypoint(
                runwayData.id + "-CROSS",
                activeRunwayCrosswind.longitude,
                activeRunwayCrosswind.latitude,
                activeRunwayCrosswind.elevation,
            ),
            new AeroflyNavRouteWaypoint(
                runwayData.id + "-DOWN",
                activeRunwayDownwind.longitude,
                activeRunwayDownwind.latitude,
                activeRunwayDownwind.elevation,
            ),
            new AeroflyNavRouteWaypoint(
                runwayData.id + "-ENTRY",
                activeRunwayEntry.longitude,
                activeRunwayEntry.latitude,
                activeRunwayEntry.elevation,
            ),
            new AeroflyNavRouteWaypoint(
                runwayData.id + "-BASE",
                activeRunwayBase.longitude,
                activeRunwayBase.latitude,
                activeRunwayBase.elevation,
            ),
            new AeroflyNavRouteWaypoint(
                runwayData.id + "-FINAL",
                activeRunwayFinal.longitude,
                activeRunwayFinal.latitude,
                activeRunwayFinal.elevation,
            ),
        ];
    }
}
