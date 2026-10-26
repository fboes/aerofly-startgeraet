import {
    AeroflyNavigationConfig,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { Point, Vector } from "@fboes/geojson";
import type z from "zod";
import type { BestRunway } from "../../../core/api/AviationWeatherAeroflyApi.js";
import { asVectorString } from "../../../core/formatter/getVectorString.js";
import type { AeroflyFlightService } from "../../../core/services/AeroflyFlightService.js";
import { randomArbitrary } from "../../../core/util/random.js";
import { UNIT_METER_PER_NM, UNIT_METER_PER_FEET } from "../../../core/util/units.js";
import {
    getAirportDataViaOrigin,
    getMinimumSafeAltitude,
    getBestRunwayViaFlightService,
    getRunwayPoint,
} from "../../util/ApiService.js";
import { degreeNormalize } from "../../../core/util/degree.js";
import type { LandingPatternMissionGeneratorConfiguration } from "./LandingPatternMissionGenerator.js";

const patternDistance_Nm = 1;
const patternFinalDistance_Nm = 1;

export async function convertScenario(
    configuration: z.infer<z.ZodObject<LandingPatternMissionGeneratorConfiguration>>,
    flightPlanService: AeroflyFlightService,
): Promise<boolean> {
    const rightPatternRunways = (configuration.rightPatternRunways ?? "").toUpperCase().split(/\s*,\s*/);

    // Establish airport
    const airportData = await getAirportDataViaOrigin(flightPlanService);
    const airportPoint = new Point(airportData.lon, airportData.lat, airportData.elev);

    // Establish aircraft position
    const aircraftHeading = randomArbitrary(0, 356);
    const aircraftVector = new Vector(
        configuration.distance_nm * UNIT_METER_PER_NM,
        degreeNormalize(aircraftHeading + 180),
    );
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
        ...getPatternWaypoints(runwayData, runwayPoint, configuration.patternAltitudeAgl_ft),
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
Your aircraft is ${asVectorString(aircraftVector)} of ${airportData.name} Airport. You will have to make a correct ${runwayData.isRight ? "right-hand" : "left-hand"} landing pattern entry for runway ${runwayData.id}, and land safely.
`;

    return true;
}

function getPatternWaypoints(
    runwayData: BestRunway,
    runwayPoint: Point,
    patternAltitudeAgl_ft: number,
): AeroflyNavRouteWaypoint[] {
    /**
     * in meters
     */
    const exitDistance: number = patternDistance_Nm * UNIT_METER_PER_NM;

    /**
     * in meters
     */
    const downwindDistance: number = patternDistance_Nm * UNIT_METER_PER_NM;

    /**
     * in meters
     */
    const finalDistance: number = patternFinalDistance_Nm * UNIT_METER_PER_NM;

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
    const activeRunwayEntry = activeRunwayDownwind.getPointBy(new Vector(finalDistance, runwayData.alignment + 180));
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
        new AeroflyNavRouteWaypoint(runwayData.id + "-ENTRY", activeRunwayEntry.longitude, activeRunwayEntry.latitude, {
            altitude: activeRunwayEntry.elevation,
        }),
        new AeroflyNavRouteWaypoint(runwayData.id + "-BASE", activeRunwayBase.longitude, activeRunwayBase.latitude, {
            altitude: activeRunwayBase.elevation,
        }),
        new AeroflyNavRouteWaypoint(runwayData.id + "-FINAL", activeRunwayFinal.longitude, activeRunwayFinal.latitude, {
            altitude: activeRunwayFinal.elevation,
        }),
    ];
}
