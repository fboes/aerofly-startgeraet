import type z from "zod";
import type { AeroflyFlightService } from "../../../core/services/AeroflyFlightService.js";
import type { HemsMissionGeneratorConfiguration } from "./HemsMissionGenerator.js";
import { Point, Vector } from "@fboes/geojson";
import {
    AeroflyNavigationConfig,
    type AeroflyNavRouteBase,
    AeroflyNavRouteDestination,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { HemsMissionLocations, type HemsMissionLocation } from "./HemsMissionLocations.js";
import { missionGeneratorArtifactDirectory } from "../../MissionGenerator.js";
import { getWaypointData } from "../../util/Waypoint.js";
import { ErrorFormatted } from "../../../core/util/ErrorFormatted.js";
import { degreeDifference, degreeNormalize } from "../../../core/util/degree.js";
import { UNIT_METER_PER_FEET, UNIT_METER_PER_NM } from "../../../core/util/units.js";

export async function convertScenario(
    configuration: z.infer<z.ZodObject<HemsMissionGeneratorConfiguration>>,
    flightPlanService: AeroflyFlightService,
): Promise<boolean> {
    const locations = new HemsMissionLocations();

    // Establish airport
    const airportWaypoint = await findAirportWaypointData(locations, flightPlanService);

    // Establish aircraft position
    const aircraftPoint = airportWaypoint.payload.point;

    // Establish emergency site
    const directory = missionGeneratorArtifactDirectory(flightPlanService.config);
    const locationsCount = await locations.loadLocationsFile(airportWaypoint.identifier, directory);
    if (locationsCount <= 0) {
        await locations.createLocationsFile(airportWaypoint, directory);
        throw new ErrorFormatted(`Did not find (correct) GeoJSON file in {{ directory }}, created a new file`, {
            directory,
        });
    }

    const emergencyWaypoint: HemsMissionLocation = locations.findRandomEmergencyWaypoint(
        airportWaypoint.payload.point,
        configuration.minRange_km * 1000,
        configuration.maxRange_km * 1000,
    );

    // Establish next hospital - if there are hospitals around
    const hospitalWaypoint: HemsMissionLocation | undefined = locations.findNearestHospitalWaypoint(emergencyWaypoint);

    // Add flight plan
    const flight = flightPlanService.getAeroflyFlight();
    const windDirection_deg = flightPlanService.getWindDirection();

    flightPlanService.setFlightPosition(
        aircraftPoint.longitude,
        aircraftPoint.latitude,
        aircraftPoint.elevation ?? 0,
        airportWaypoint.payload.direction ?? flight.flightSetting.heading_degree,
        0,
        configuration.isColdAndDark ? "ColdAndDark" : "OnGround",
    );

    flight.navigation = new AeroflyNavigationConfig(aircraftPoint.elevation ?? 0, [
        ...getDepartureWaypoints(airportWaypoint, windDirection_deg),
        ...getEmergencyWaypoints(emergencyWaypoint),
        ...getHospitalWaypoints(hospitalWaypoint, windDirection_deg),
        ...getDestinationWaypoints(airportWaypoint, windDirection_deg),
    ]);
    flight._missionTitle = `MedEvac at ${emergencyWaypoint.title ?? "emergency site"}`;
    flight._missionBriefing = `\
Fly to ${emergencyWaypoint.title ?? "emergency site"} to drop off your emergency doctor / paramedic, and take a patient on board if necessary.
Afterwards fly to ${hospitalWaypoint?.title ?? airportWaypoint.title}.
    `;

    return true;
}

async function findAirportWaypointData(
    locations: HemsMissionLocations,
    flightPlanService: AeroflyFlightService,
): Promise<HemsMissionLocation> {
    const icaoId = flightPlanService.getFlightplanDepartureAirportString();
    const airport = locations.findHeliportWaypointByIcaoId(icaoId);
    if (airport) {
        return airport;
    }

    const airportData = await getWaypointData(icaoId, flightPlanService.getAeroflyFlight().navigation.waypoints);
    if (!airportData) {
        throw new ErrorFormatted("Airport not found: {{ icaoId }}", { icaoId });
    }

    return {
        ...airportData,
        payload: {
            point: new Point(airportData.longitude, airportData.latitude, airportData.altitude_m),
        },
    };
}

// -----------------------------------------------------------------------------

function getDepartureWaypoints(airportWaypoint: HemsMissionLocation, windDirection_deg: number): AeroflyNavRouteBase[] {
    return [
        new AeroflyNavRouteOrigin(airportWaypoint.identifier, airportWaypoint.longitude, airportWaypoint.latitude, {
            elevation: airportWaypoint.altitude_m,
        }),
        ...getApproachWaypoints(airportWaypoint, windDirection_deg, true),
    ];
}

function getDestinationWaypoints(
    airportWaypoint: HemsMissionLocation,
    windDirection_deg: number,
): AeroflyNavRouteBase[] {
    return [
        ...getApproachWaypoints(airportWaypoint, windDirection_deg),
        new AeroflyNavRouteDestination(
            airportWaypoint.identifier,
            airportWaypoint.longitude,
            airportWaypoint.latitude,
            {
                elevation: airportWaypoint.altitude_m,
            },
        ),
    ];
}

function getEmergencyWaypoints(emergencyWaypoint: HemsMissionLocation): AeroflyNavRouteWaypoint[] {
    return [
        new AeroflyNavRouteWaypoint("MEDEVAC", emergencyWaypoint.longitude, emergencyWaypoint.latitude, {
            altitude: emergencyWaypoint.altitude_m,
            navaidFrequency_khz: emergencyWaypoint.freq_khz,
            flyOver: true,
        }),
    ];
}

function getHospitalWaypoints(
    hospitalWaypoint: HemsMissionLocation | undefined,
    windDirection_deg: number,
): AeroflyNavRouteWaypoint[] {
    if (!hospitalWaypoint) {
        return [];
    }

    return [
        ...getApproachWaypoints(hospitalWaypoint, windDirection_deg),
        new AeroflyNavRouteWaypoint("HOSPITAL", hospitalWaypoint.longitude, hospitalWaypoint.latitude, {
            altitude: hospitalWaypoint.altitude_m,
            navaidFrequency_khz: hospitalWaypoint.freq_khz,
            flyOver: true,
        }),
        ...getApproachWaypoints(hospitalWaypoint, windDirection_deg, true),
    ];
}

function getApproachWaypoints(
    missionLocation: HemsMissionLocation,
    windDirection_deg: number,
    asDeparture: boolean = false,
): AeroflyNavRouteWaypoint[] {
    if (!missionLocation.payload.approaches) {
        return [];
    }

    /**
     * @param {number} alignment
     * @returns {number}
     */
    const difference = (alignment: number): number => {
        return Math.abs(degreeDifference((alignment + (asDeparture ? 180 : 0)) % 360, windDirection_deg));
    };

    const approach = missionLocation.payload.approaches.reduce((a, b) => {
        return difference(a) < difference(b) ? a : b;
    });

    const course = (approach + (asDeparture ? 180 : 0)) % 360;
    const approachPoint = missionLocation.payload.point.getPointBy(
        new Vector(UNIT_METER_PER_NM * (asDeparture ? 0.75 : 1.5), degreeNormalize(approach + 180)),
    );

    return [
        new AeroflyNavRouteWaypoint(
            `${String(Math.round(course / 10) % 36).padStart(2, "0")}H`,
            approachPoint.longitude,
            approachPoint.latitude,
            {
                altitude: approachPoint.elevation ? approachPoint.elevation + 500 * UNIT_METER_PER_FEET : undefined,
            },
        ),
    ];
}
