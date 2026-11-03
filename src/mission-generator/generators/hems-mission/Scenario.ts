import path from "node:path";
import type z from "zod";
import type { AeroflyFlightService } from "../../../core/services/AeroflyFlightService.js";
import type { HemsMissionGeneratorConfiguration } from "./HemsMissionGenerator.js";
import { Vector } from "@fboes/geojson";
import {
    AeroflyNavigationConfig,
    type AeroflyNavRouteBase,
    AeroflyNavRouteDestination,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { HemsMissionLocations, type HemsMissionLocation } from "./HemsMissionLocations.js";
import { getLocationData } from "../../util/Location.js";
import { ErrorDetail, ErrorFormatted } from "../../../core/util/ErrorFormatted.js";
import { degreeDifference, degreeNormalize } from "../../../core/util/degree.js";
import { UNIT_METER_PER_FEET, UNIT_METER_PER_NM } from "../../../core/util/units.js";
import { DIR_ASSETS, poiDirectory } from "../../../core/util/directory.js";

const DIR_HEMS_FALLBACK = path.join(DIR_ASSETS, "mission-generator");

export async function convertScenario(
    configuration: z.infer<z.ZodObject<HemsMissionGeneratorConfiguration>>,
    flightPlanService: AeroflyFlightService,
): Promise<boolean> {
    const locations = new HemsMissionLocations();
    const originLocation = await findAirportLocation(locations, flightPlanService);

    const directory = poiDirectory(flightPlanService.config);
    let locationsCount = await locations.loadLocationsFile(originLocation, directory);
    if (locationsCount <= 0) {
        locationsCount = await locations.loadLocationsFile(originLocation, DIR_HEMS_FALLBACK);
    }
    if (locationsCount <= 0) {
        await locations.createLocationsFile(originLocation, directory);
        await locations.createPoiFiles(originLocation, directory);
        throw new ErrorFormatted(`Did not find (correct) GeoJSON file in {{ directory }}, created a new file`, {
            directory,
        });
    }

    if (configuration.createPois) {
        await locations.createPoiFiles(originLocation, directory);
    }

    // Establish airport
    const airportLocation = await findAirportLocation(locations, flightPlanService);

    // Establish emergency site
    const emergencyLocation: HemsMissionLocation = locations.findRandomEmergencyLocation(
        airportLocation.position,
        configuration.minRange_km * 1000,
        configuration.maxRange_km * 1000,
    );

    // Establish next hospital - if there are hospitals around
    const hospitalLocation: HemsMissionLocation | undefined = locations.findNearestHospitalLocation(emergencyLocation);

    // Add flight plan
    const flight = flightPlanService.getAeroflyFlight();
    const windDirection_deg = flightPlanService.getWindDirection();

    flightPlanService.setFlightPosition(
        airportLocation.position.longitude,
        airportLocation.position.latitude,
        airportLocation.position.elevation ?? 0,
        airportLocation.payload.direction ?? flight.flightSetting.heading_degree,
        0,
        configuration.isColdAndDark ? "ColdAndDark" : "OnGround",
    );

    flight.navigation = new AeroflyNavigationConfig(airportLocation.position.elevation ?? 0, [
        ...getDepartureWaypoints(airportLocation, windDirection_deg),
        ...getEmergencyWaypoints(emergencyLocation),
        ...getHospitalWaypoints(hospitalLocation, windDirection_deg),
        ...getDestinationWaypoints(airportLocation, windDirection_deg),
    ]);
    flight._missionTitle = `MedEvac at ${emergencyLocation.title ?? "emergency site"}`;
    flight._missionBriefing = `\
Fly to ${emergencyLocation.title ?? "emergency site"} to drop off your emergency doctor / paramedic, and take a patient on board if necessary.
Afterwards fly to ${hospitalLocation?.title ?? airportLocation.title}.
    `;

    return true;
}

async function findAirportLocation(
    locations: HemsMissionLocations,
    flightPlanService: AeroflyFlightService,
): Promise<HemsMissionLocation> {
    const icaoId = flightPlanService.getFlightplanDepartureAirportIdentifier();
    const airport = locations.findHeliportLocationByIcaoId(icaoId);
    if (airport) {
        return airport;
    }

    const airportData = await getLocationData(icaoId, flightPlanService.getAeroflyFlight().navigation.waypoints);
    if (!airportData) {
        throw new ErrorDetail("Airport not found", icaoId);
    }

    return {
        ...airportData,
        payload: {},
    };
}

// -----------------------------------------------------------------------------

function getDepartureWaypoints(airportLocation: HemsMissionLocation, windDirection_deg: number): AeroflyNavRouteBase[] {
    return [
        new AeroflyNavRouteOrigin(
            airportLocation.identifier,
            airportLocation.position.longitude,
            airportLocation.position.latitude,
            {
                elevation: airportLocation.position.elevation,
            },
        ),
        ...getApproachWaypoints(airportLocation, windDirection_deg, true),
    ];
}

function getDestinationWaypoints(
    airportLocation: HemsMissionLocation,
    windDirection_deg: number,
): AeroflyNavRouteBase[] {
    return [
        ...getApproachWaypoints(airportLocation, windDirection_deg),
        new AeroflyNavRouteDestination(
            airportLocation.identifier,
            airportLocation.position.longitude,
            airportLocation.position.latitude,
            {
                elevation: airportLocation.position.elevation,
            },
        ),
    ];
}

function getEmergencyWaypoints(emergencyLocation: HemsMissionLocation): AeroflyNavRouteWaypoint[] {
    return [
        new AeroflyNavRouteWaypoint(
            "MEDEVAC",
            emergencyLocation.position.longitude,
            emergencyLocation.position.latitude,
            {
                altitude: emergencyLocation.position.elevation,
                navaidFrequency_khz: emergencyLocation.freq_khz,
                flyOver: true,
            },
        ),
    ];
}

function getHospitalWaypoints(
    hospitalLocation: HemsMissionLocation | undefined,
    windDirection_deg: number,
): AeroflyNavRouteWaypoint[] {
    if (!hospitalLocation) {
        return [];
    }

    return [
        ...getApproachWaypoints(hospitalLocation, windDirection_deg),
        new AeroflyNavRouteWaypoint(
            "HOSPITAL",
            hospitalLocation.position.longitude,
            hospitalLocation.position.latitude,
            {
                altitude: hospitalLocation.position.elevation,
                navaidFrequency_khz: hospitalLocation.freq_khz,
                flyOver: true,
            },
        ),
        ...getApproachWaypoints(hospitalLocation, windDirection_deg, true),
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
    const approachPoint = missionLocation.position.getPointBy(
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
