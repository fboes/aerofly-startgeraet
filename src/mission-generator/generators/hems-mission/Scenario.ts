import type z from "zod";
import type { AeroflyFlightService } from "../../../core/services/AeroflyFlightService.js";
import type { HemsMissionGeneratorConfiguration } from "./HemsMissionGenerator.js";
import { Point } from "@fboes/geojson";
import { randomArbitrary } from "../../../core/util/random.js";
import { getAirportDataViaOrigin } from "../../util/ApiService.js";
import { AeroflyNavigationConfig, AeroflyNavRouteWaypoint } from "@fboes/aerofly-custom-missions";
import { HemsMissionLocations, type HemsMissionLocation } from "./HemsMissionLocations.js";
import { missionGeneratorArtifactDirectory } from "../../MissionGenerator.js";

export async function convertScenario(
    configuration: z.infer<z.ZodObject<HemsMissionGeneratorConfiguration>>,
    flightPlanService: AeroflyFlightService,
): Promise<boolean> {
    // Establish airport
    const airportData = await getAirportDataViaOrigin(flightPlanService);
    const airportPoint = new Point(airportData.lon, airportData.lat, airportData.elev);

    // Establish aircraft position
    const aircraftHeading = randomArbitrary(0, 356);
    const aircraftPoint = airportPoint;

    // Establish emergency site
    const locations = new HemsMissionLocations(configuration.minRange_km * 1000, configuration.maxRange_km * 1000);
    locations.loadLocations(airportData.icaoId, missionGeneratorArtifactDirectory(flightPlanService.config));

    const emergencyWaypoint: HemsMissionLocation = locations.getRandomEmergencyWaypoint(airportPoint);

    // Establish next hospital - if there are hospitals around
    const hospitalWaypoint: HemsMissionLocation | undefined = locations.getNearestHospitalWaypoint(emergencyWaypoint);

    // Add flight plan
    const departureAirport = flightPlanService.getFlightplanDepartureAirport();
    if (!departureAirport) {
        throw new Error("No valid flight plan found to insert holding pattern into");
    }

    flightPlanService.setFlightPosition(
        aircraftPoint.longitude,
        aircraftPoint.latitude,
        aircraftPoint.elevation ?? 0,
        aircraftHeading,
        0,
        configuration.isColdAndDark ? "ColdAndDark" : "OnGround",
    );

    const flight = flightPlanService.getAeroflyFlight();
    flight.navigation = new AeroflyNavigationConfig(aircraftPoint.elevation ?? 0, [
        departureAirport,
        ...getEmergencyWaypoints(emergencyWaypoint),
        ...getHospitalWaypoints(emergencyWaypoint),
        departureAirport,
    ]);
    flight._missionTitle = `MedEvac at ${emergencyWaypoint.title ?? "emergency site"}`;
    flight._missionBriefing = `\
Fly to ${emergencyWaypoint.title ?? "emergency site"} to drop off your emergency doctor / paramedic, and take a patient on board if necessary.
Afterwards fly to ${hospitalWaypoint?.title ?? airportData.name}.
    `;

    return true;
}

function getEmergencyWaypoints(emergencyWaypoint: HemsMissionLocation): AeroflyNavRouteWaypoint[] {
    return [
        new AeroflyNavRouteWaypoint(
            emergencyWaypoint.identifier,
            emergencyWaypoint.longitude,
            emergencyWaypoint.latitude,
            {
                altitude: emergencyWaypoint.altitude_m,
                navaidFrequency_khz: emergencyWaypoint.freq_khz,
                flyOver: true,
            },
        ),
    ];
}

function getHospitalWaypoints(hospitalWaypoint: HemsMissionLocation | undefined): AeroflyNavRouteWaypoint[] {
    if (!hospitalWaypoint) {
        return [];
    }

    // TODO: Check approach
    return [
        new AeroflyNavRouteWaypoint(
            hospitalWaypoint.identifier,
            hospitalWaypoint.longitude,
            hospitalWaypoint.latitude,
            {
                altitude: hospitalWaypoint.altitude_m,
                navaidFrequency_khz: hospitalWaypoint.freq_khz,
                flyOver: true,
            },
        ),
    ];
}
