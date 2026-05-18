import {
    AeroflyFlight,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestinationRunway,
    AeroflySettingsCloud,
} from "@fboes/aerofly-custom-missions";
import { Point, Vector } from "@fboes/geojson";
import * as SunPosition from "./SunPosition.js";

export type AeroflylightCategoryIcao = "VFR" | "IFR";

export type AeroflylightCategory = AeroflylightCategoryIcao | "MVFR" | "LIFR";

/**
 * Offer additional properties derived from `AeroflyFlight` classes
 */

/**
 * @returns nautical time zone offset based on the coordinates of the departure airport
 */
export function getLocalTomeZoneOffset(aeroflyFlight: AeroflyFlight): number {
    return Math.round(
        (aeroflyFlight.navigation.waypoints.find((wp) => wp instanceof AeroflyNavRouteOrigin)?.longitude ?? 0) / 15,
    );
}

/**
 * @returns the given runway position moved by its length along its direction to the possible runway threshold (instead of its center). Also normalizes the runway identifier to match Aerofly FS4 standards.
 */
export function positionRunwayWaypoint<T extends AeroflyNavRouteDepartureRunway | AeroflyNavRouteDestinationRunway>(
    waypoint: T,
): T {
    const direction_degree = waypoint.direction_degree ?? Number(waypoint.identifier.replace(/\D+/g, "")) * 10;
    const runwayLength = waypoint.runwayLength ?? 1500;

    const coordinates = new Point(waypoint.longitude, waypoint.latitude);
    const coordinatesNew = coordinates.getPointBy(new Vector(runwayLength / 2, direction_degree + 180));

    waypoint.latitude = coordinatesNew.latitude;
    waypoint.longitude = coordinatesNew.longitude;
    waypoint.direction_degree = direction_degree;
    waypoint.identifier = waypoint.identifier.replace(/^\D+/, "").toUpperCase();

    return waypoint;
}

export function getFlightCategory(aeroflyFlight: AeroflyFlight): AeroflylightCategory {
    const ceiling = getCeiling(aeroflyFlight);
    const visibility_miles = aeroflyFlight.visibility_sm;

    if (visibility_miles > 5 && (!ceiling?.height_ft || ceiling.height_ft > 3000)) {
        return "VFR";
    } else if (visibility_miles >= 3 && (!ceiling?.height_ft || ceiling.height_ft >= 1000)) {
        return "MVFR";
    } else if (visibility_miles >= 1 && (!ceiling?.height_ft || ceiling.height_ft >= 500)) {
        return "IFR";
    }
    return "LIFR";
}

export function getIcaoFlightCategory(aeroflyFlight: AeroflyFlight): AeroflylightCategoryIcao {
    const ceiling = getCeiling(aeroflyFlight);

    return aeroflyFlight.visibility_meter >= 5000 && (!ceiling?.height_ft || ceiling.height_ft >= 1500) ? "VFR" : "IFR";
}

export function getCeiling(aeroflyFlight: AeroflyFlight): AeroflySettingsCloud | undefined {
    return [...aeroflyFlight.clouds]
        .sort((a, b) => a.height - b.height)
        .find((c) => {
            return c.density_code === "BKN" || c.density_code === "OVC";
        });
}

export function getSunPosition(aeroflyFlight: AeroflyFlight): { elevation: number; azimuth: number } {
    return SunPosition.calculateSunPosition(
        aeroflyFlight.timeUtc.timeHours,
        aeroflyFlight.timeUtc.time,
        aeroflyFlight.navigation.waypoints[0].latitude,
        aeroflyFlight.navigation.waypoints[0].longitude,
    );
}

export function getLocalTimeAndDate(aeroflyFlight: AeroflyFlight): Date {
    const departureTimeZoneOffset = getLocalTomeZoneOffset(aeroflyFlight) * 60;
    const localTime = new Date(aeroflyFlight.timeUtc.time.getTime() + departureTimeZoneOffset * 60000);
    return localTime;
}
