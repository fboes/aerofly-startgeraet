import {
    type AeroflyFlight,
    AeroflySettingsAircraft,
    AeroflySettingsFlight,
    AeroflySettingsFuelLoad,
    AeroflyTimeUtc,
    AeroflySettingsWind,
    AeroflySettingsCloud,
    AeroflyNavigationConfig,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteWaypoint,
} from "@fboes/aerofly-custom-missions";
import { fetchSimBriefFlightPlan } from "./SimBriefApi.js";
import type { SimBriefApiPayload, SimBriefApiPayloadAirport } from "./SimBriefApi.type.js";
import { metarParser } from "aewx-metar-parser";
import { findAeroflyAircraftByIcaoCode, findAeroflyLiveryByIcaoCode } from "../services/getAeroflyAircraft.js";
import { positionRunwayWaypoint } from "../util/AeroflyFlightHelper.js";
import { ErrorDetail } from "../util/ErrorFormatted.js";

/**
 *
 * @param username
 * @param flight
 * @param useDestinationWeather 0 for origin, 1 for destination, -1 for none at all
 */
export async function fetchSimBriefToAerofly(
    username: string,
    flight: AeroflyFlight,
    useDestinationWeather: number = 0,
): Promise<void> {
    const simbriefPayload = await fetchSimBriefFlightPlan(username);
    convertMission(simbriefPayload, flight, useDestinationWeather);
}

/**
 *
 * @param simbriefPayload
 * @param flight
 * @param useDestinationWeather 0 for origin, 1 for destination, -1 for none at all
 */
export function convertMission(
    simbriefPayload: SimBriefApiPayload,
    flight: AeroflyFlight,
    useDestinationWeather: number = 0,
): void {
    if (useDestinationWeather >= 0) {
        convertWeather(flight, useDestinationWeather === 0 ? simbriefPayload.origin : simbriefPayload.destination);
    }

    const originRunwayPayload = simbriefPayload.tlr.takeoff.runway.find(
        (r) => r.identifier === simbriefPayload.origin.plan_rwy,
    );
    const originRunway = positionRunwayWaypoint(
        new AeroflyNavRouteDepartureRunway(
            simbriefPayload.origin.plan_rwy,
            Number(simbriefPayload.origin.pos_long),
            Number(simbriefPayload.origin.pos_lat),
            {
                elevation_ft: originRunwayPayload?.elevation ? Number(originRunwayPayload.elevation) : undefined,
                direction_degree: originRunwayPayload?.true_course
                    ? Number(originRunwayPayload.true_course)
                    : parseRunwayDirection(simbriefPayload.origin.plan_rwy),
                runwayLength_ft: originRunwayPayload?.length ? Number(originRunwayPayload.length) : undefined,
            },
        ),
    );

    const destinationWaypointPayload = simbriefPayload.tlr.landing.runway.find(
        (r) => r.identifier === simbriefPayload.destination.plan_rwy,
    );
    const destinationWaypoint = positionRunwayWaypoint(
        new AeroflyNavRouteDestinationRunway(
            simbriefPayload.destination.plan_rwy,
            Number(simbriefPayload.destination.pos_long),
            Number(simbriefPayload.destination.pos_lat),
            {
                elevation_ft: destinationWaypointPayload?.elevation
                    ? Number(destinationWaypointPayload.elevation)
                    : undefined,
                direction_degree: destinationWaypointPayload?.true_course
                    ? Number(destinationWaypointPayload.true_course)
                    : parseRunwayDirection(simbriefPayload.destination.plan_rwy),
                runwayLength_ft: destinationWaypointPayload?.length
                    ? Number(destinationWaypointPayload.length)
                    : undefined,
            },
        ),
    );

    flight.flightSetting = AeroflySettingsFlight.createInFeet(
        originRunway?.longitude ?? Number(simbriefPayload.origin.pos_long),
        originRunway?.latitude ?? Number(simbriefPayload.origin.pos_long),
        originRunway?.elevation_ft ?? Number(simbriefPayload.origin.elevation),
        Number(destinationWaypointPayload?.true_course ?? 0),
        0,
        {
            gear: 1,
            throttle: 0,
            flaps: 0,
            configuration: "OnGround",
            onGround: true,
            airport: simbriefPayload.origin.icao_code,
            runway: simbriefPayload.origin.plan_rwy,
        },
    );

    try {
        const { aeroflyAircraftCode, aeroflyAircraftLivery } = findAeroflyAircraftCode(
            simbriefPayload.aircraft.icaocode,
            simbriefPayload.general.icao_airline,
        );
        flight.aircraft = new AeroflySettingsAircraft(aeroflyAircraftCode, aeroflyAircraftLivery);
        flight.fuelLoadSetting = new AeroflySettingsFuelLoad(
            aeroflyAircraftCode,
            Number(simbriefPayload.fuel.plan_ramp),
            Number(simbriefPayload.weights.payload),
            "Keep",
        );
    } catch (e) {
        if (!(e instanceof Error)) {
            throw e;
        }
    }

    flight.timeUtc = new AeroflyTimeUtc(new Date(simbriefPayload.times.sched_out));

    const waypoints = getWaypointsFromNavlog(simbriefPayload);
    flight.navigation = AeroflyNavigationConfig.createInFeet(
        Number(simbriefPayload.general.initial_altitude),
        [
            new AeroflyNavRouteOrigin(
                simbriefPayload.origin.icao_code,
                Number(simbriefPayload.origin.pos_long),
                Number(simbriefPayload.origin.pos_lat),
                {
                    elevation_ft: Number(simbriefPayload.origin.elevation),
                },
            ),
            originRunway,
            ...waypoints,
            destinationWaypoint,
            new AeroflyNavRouteDestination(
                simbriefPayload.destination.icao_code,
                Number(simbriefPayload.destination.pos_long),
                Number(simbriefPayload.destination.pos_lat),
                {
                    elevation_ft: Number(simbriefPayload.destination.elevation),
                },
            ),
        ],
        Number(simbriefPayload.general.cruise_tas),
    );
}

function getWaypointsFromNavlog(simbriefPayload: SimBriefApiPayload): AeroflyNavRouteWaypoint[] {
    const wayPoints = simbriefPayload.navlog
        .filter((navlogItem) => navlogItem.type !== "ltlg")
        .map(
            (navlogItem) =>
                new AeroflyNavRouteWaypoint(navlogItem.ident, Number(navlogItem.pos_long), Number(navlogItem.pos_lat), {
                    altitude_ft: Number(navlogItem.altitude_feet),
                    navaidFrequency:
                        Number(navlogItem.frequency) > 118
                            ? Number(navlogItem.frequency) * 1000
                            : Number(navlogItem.frequency) * 1_000_000,
                }),
        );

    wayPoints.pop();
    return wayPoints;
}

function convertWeather(flight: AeroflyFlight, airport: SimBriefApiPayloadAirport) {
    const metar = metarParser(airport.metar);

    flight.wind = new AeroflySettingsWind(
        metar.wind.speed_kts ?? 0,
        metar.wind.degrees ?? 0,
        metar.wind.gust_kts ?? 0,
        metar.temperature?.celsius ?? 14,
    );

    flight.clouds = metar.clouds.map((metarCloud) => {
        const cloud = AeroflySettingsCloud.createInFeet(0, metarCloud.feet);
        cloud.density_code = metarCloud.code;
        return cloud;
    });

    flight.visibility_meter = metar.visibility?.meters ?? 9999;
}

function findAeroflyAircraftCode(
    simbriefIcaoCode: string,
    simbriefAirlineCode: string,
): {
    aeroflyAircraftCode: string;
    aeroflyAircraftLivery: string;
} {
    const aeroflyAircraft = findAeroflyAircraftByIcaoCode(simbriefIcaoCode);
    if (!aeroflyAircraft) {
        throw new ErrorDetail(`Could not find matching Aerofly aircraft for SimBrief ICAO code`, simbriefIcaoCode);
    }

    const aeroflyAircraftLivery = findAeroflyLiveryByIcaoCode(aeroflyAircraft, simbriefAirlineCode);

    return {
        aeroflyAircraftCode: aeroflyAircraft.aeroflyCode,
        aeroflyAircraftLivery: aeroflyAircraftLivery?.aeroflyCode ?? "",
    };
}

function parseRunwayDirection(runway: string): number {
    return Number(runway.replace(/\D+/g, "")) * 10;
}
