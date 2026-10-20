import {
    type AeroflyFlight,
    type AeroflyNavRouteBase,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
} from "@fboes/aerofly-custom-missions";
import { RoutePlanService } from "../services/RoutePlanService.js";
import { findAeroflyAircraft, findAeroflyLivery } from "../services/getAeroflyAircraft.js";
import { findAeroflyAirportByIcaoCode } from "../services/getAeroflyAirport.js";
import { getIcaoFlightCategory, getSunPosition, getFlightCategory } from "../util/AeroflyFlightHelper.js";
import { getHourString } from "./getTimeString.js";
import { numberFormat } from "./numberFormat.js";

export type AeroflyFlightFormatterSunPosition = "Day" | "Night" | "Twilight";

/**
 * Additional methods to have human-readable representations of `AeroflyFlight` properties.
 */

/**
 * @returns full aircraft name as well as livery description
 */
export function aircraftString(aeroflyFlight: AeroflyFlight): string {
    const currentAircraft = findAeroflyAircraft(aeroflyFlight.aircraft.name);
    if (!currentAircraft) {
        return "No aircraft selected";
    }

    const currentLivery = findAeroflyLivery(currentAircraft, aeroflyFlight.aircraft.paintscheme);
    return `${currentAircraft.nameFull} - ${currentLivery?.name ?? "Default Livery"}`;
}

export function fuelAndPayloadString(aeroflyFlight: AeroflyFlight): string {
    return aeroflyFlight.fuelLoadSetting.fuelMass
        ? `${numberFormat(aeroflyFlight.fuelLoadSetting.fuelMass)} / ${numberFormat(aeroflyFlight.fuelLoadSetting.payloadMass)} kg`
        : "Unset";
}

export function flightPlanShortString(aeroflyFlight: AeroflyFlight): string {
    return `${originIdentifierString(aeroflyFlight)}-${destinationIdentifierString(aeroflyFlight)}`.replace(
        /[^a-zA-Z0-9_-]+/g,
        "-",
    );
}

export function originIdentifierString(aeroflyFlight: AeroflyFlight): string {
    return (
        aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteOrigin)?.identifier ?? "Unknown"
    );
}

export function originFullNameString(aeroflyFlight: AeroflyFlight): string {
    const airportCode = originIdentifierString(aeroflyFlight);
    const airportName = airportNameString(airportCode);

    return airportName ? `${airportName} (${airportCode})` : airportCode;
}

export function airportNameString(airportCode: string): string {
    return airportCode !== "Unknown" ? (findAeroflyAirportByIcaoCode(airportCode)?.name ?? "Unknown") : "";
}

export function destinationIdentifierString(aeroflyFlight: AeroflyFlight): string {
    return (
        aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteDestination)?.identifier ??
        "Unknown"
    );
}

export function destinationFullNameString(aeroflyFlight: AeroflyFlight): string {
    const airportCode = destinationIdentifierString(aeroflyFlight);
    const airportName = airportNameString(airportCode);

    return airportName ? `${airportName} (${airportCode})` : airportCode;
}

/**
 * @returns full name of origin / destination as well as distance
 * @see originFullNameString
 * @see destinationFullNameString
 * @see distanceTimeString
 */
export function flightPlanExtendedString(aeroflyFlight: AeroflyFlight): string {
    return `${originFullNameString(aeroflyFlight)} → ${destinationFullNameString(aeroflyFlight)} (${distanceTimeString(aeroflyFlight)})`;
}

/**
 * @param aeroflyFlight
 * @param maxLength if >= 2 this will limit the amount of waypoints returned in the string
 * @returns waypoints (excluding runways) in a human-readable string
 */
export function waypointsString(aeroflyFlight: AeroflyFlight, maxLength = 0): string {
    if (aeroflyFlight.navigation.waypoints.length === 0) {
        return "No waypoints";
    }

    const firstWaypoint = aeroflyFlight.navigation.waypoints[0];
    if (!firstWaypoint) {
        throw new Error("No first waypoint found");
    }
    const lastWaypoint = aeroflyFlight.navigation.waypoints[aeroflyFlight.navigation.waypoints.length - 1];
    if (!lastWaypoint) {
        throw new Error("No last waypoint found");
    }

    const waypoints = (maxLength === 2 ? [firstWaypoint, lastWaypoint] : aeroflyFlight.navigation.waypoints)
        .filter(
            (wp) => !(wp instanceof AeroflyNavRouteDepartureRunway || wp instanceof AeroflyNavRouteDestinationRunway),
        )
        .map((wp: AeroflyNavRouteBase): string => {
            return wp.identifier;
        });

    if (maxLength > 2 && waypoints.length >= maxLength + 1) {
        waypoints.splice(1, waypoints.length - maxLength + 1, "…");
    }

    return waypoints.join(" → ");
}

/**
 * @returns combined distance and time string
 */
export function distanceTimeString(aeroflyFlight: AeroflyFlight): string {
    const currentAircraft = findAeroflyAircraft(aeroflyFlight.aircraft.name);
    if (!currentAircraft) {
        return "Unknown";
    }

    const route = new RoutePlanService(aeroflyFlight).getRoute();
    const distanceNm = route.distanceTotal_nm;
    const hourString = getHourString(route.estimatedTimeEnrouteTotal_min);

    return distanceNm ? `${numberFormat(distanceNm)}NM${hourString ? ", " + hourString + "h" : ""}` : "Unknown";
}

/**
 * @see getIcaoFlightCategory
 * @see getFlightCategory
 */
export function flightCategoryCombinedString(aeroflyFlight: AeroflyFlight): string {
    return `ICAO: ${getIcaoFlightCategory(aeroflyFlight)} | US: ${getFlightCategory(aeroflyFlight)}`;
}

/**
 * @returns wind speed, direction and gusts
 */
export function windString(aeroflyFlight: AeroflyFlight): string {
    let wind = `${numberFormat(aeroflyFlight.wind.directionInDegree)}° @ ${numberFormat(aeroflyFlight.wind.speed_kts)}kts`;
    if (aeroflyFlight.wind.gust_kts > 0) {
        wind += ` (gusts ${numberFormat(aeroflyFlight.wind.gust_kts)}kts)`;
    }
    return wind;
}

export function temperatureString(aeroflyFlight: AeroflyFlight): string {
    return numberFormat(aeroflyFlight.wind.temperature_celsius) + `°C`;
}

/**
 * @returns visbiility in SM as well as meters, seperated by `separator`
 */
export function visbilityString(aeroflyFlight: AeroflyFlight, separator = "/"): string {
    if (aeroflyFlight.visibility_sm === 10 || aeroflyFlight.visibility_meter === 9999) {
        return `10SM ${separator} ${numberFormat(9999)}m`;
    }

    return `${numberFormat(aeroflyFlight.visibility_sm) + quarter(aeroflyFlight.visibility_sm)}SM ${separator} ${numberFormat(aeroflyFlight.visibility_meter)}m`;
}

/**
 * @returns multiple cloud base & density values, joined by `join`
 */
export function cloudString(aeroflyFlight: AeroflyFlight, join = " | "): string {
    return (
        aeroflyFlight.clouds
            .filter((cloud) => cloud.density > 0)
            .map((cloud) => {
                return `${cloud.density_code} @ ${numberFormat(cloud.height_ft)}ft`;
            })
            .join(join) || "CLR"
    );
}

/**
 * @returns the civil sun position, e.g. `Day`
 */
export function sunPositionNameString(aeroflyFlight: AeroflyFlight): AeroflyFlightFormatterSunPosition {
    const solarElevationAngleDeg = getSunPosition(aeroflyFlight).elevation;

    if (solarElevationAngleDeg >= 0) {
        return "Day";
    }
    if (solarElevationAngleDeg >= -6) {
        return "Twilight";
    }

    return "Night";
}

/**
 * @returns a human readable name
 */
export function dateToString(date: Date): string {
    return date.toISOString().substring(0, 16).replace("T", " ");
}

/**
 * @returns an ASCII value fo the current values fraction, rounded to the next qarter
 */
function quarter(value: number): string {
    value = Math.round(value * 4) / 4;
    const quarter = Math.floor((value % 1) * 4);
    switch (quarter) {
        case 1:
            return "¼";
        case 2:
            return "½";
        case 3:
            return "¾";
    }
    return "";
}
