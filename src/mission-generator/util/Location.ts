import {
    AeroflyNavRouteDepartureRunway,
    AeroflyNavRouteDestination,
    AeroflyNavRouteDestinationRunway,
    AeroflyNavRouteOrigin,
    AeroflyNavRouteWaypoint,
    type AeroflyNavRouteBase,
} from "@fboes/aerofly-custom-missions";
import { AviationWeatherApi } from "../../core/api/AviationWeatherApi.js";
import { numberFormat } from "../../core/formatter/numberFormat.js";
import { ErrorDetail } from "../../core/util/ErrorFormatted.js";
import type { MissionGeneratorLocation } from "../MissionGenerator.type.js";
import { Point } from "@fboes/geojson";

/**
 * Keeps normalized airports, navigational aids and fixes cached after fetching
 * from API or extracted from flight plan
 */
const locationCache = new Map<string, MissionGeneratorLocation>();

/**
 * Will try to extract waypoint by identifier from flight plan, or ask
 * API to get waypoint / location data. Will also use caching.
 *
 * @see getFlightplanLocationData
 * @see getNavaidLocationData
 * @see getAirportLocationData
 * @see getFixLocationData
 */
export async function getLocationData(
    identifier: string,
    waypoints: AeroflyNavRouteBase[] = [],
): Promise<MissionGeneratorLocation | undefined> {
    if (waypoints) {
        const aerofly = await getFlightplanLocationData(identifier, waypoints);
        if (aerofly) {
            return aerofly;
        }
    }

    switch (identifier.length) {
        case 2:
        case 3:
            return await getNavaidLocationData(identifier);
        case 4:
            return await getAirportLocationData(identifier);
        case 5:
            return await getFixLocationData(identifier);
    }

    throw new ErrorDetail("Did not find data for waypoint / location identifier", identifier);
}

/**
 * Will try to extract waypoint by identifier from flight plan
 * Will also use caching.
 */
export async function getFlightplanLocationData(
    identifier: string,
    locations: AeroflyNavRouteBase[],
): Promise<MissionGeneratorLocation | undefined> {
    if (locationCache.has(identifier)) {
        return locationCache.get(identifier);
    }

    const location = locations.find((w) => w.identifier === identifier);
    if (location) {
        const locationData: MissionGeneratorLocation = convertAeroflyNavRouteBaseToMissionGeneratorLocation(location);
        locationCache.set(identifier, locationData);
        return locationData;
    }
}

function convertAeroflyNavRouteBaseToMissionGeneratorLocation(wp: AeroflyNavRouteBase): MissionGeneratorLocation {
    const elevation =
        wp instanceof AeroflyNavRouteOrigin ||
        wp instanceof AeroflyNavRouteDestination ||
        wp instanceof AeroflyNavRouteDepartureRunway ||
        wp instanceof AeroflyNavRouteDestinationRunway
            ? wp.elevation
            : undefined;

    const freq_khz = wp instanceof AeroflyNavRouteWaypoint ? (wp.navaidFrequency_khz ?? undefined) : undefined;

    return {
        position: new Point(wp.longitude, wp.latitude, elevation),
        identifier: wp.identifier,
        freq_khz,
    };
}

/**
 * Will try fetch navigational aid waypoint / location data from API.
 * Will also use caching.
 */
export async function getNavaidLocationData(identifier: string): Promise<MissionGeneratorLocation | undefined> {
    if (locationCache.has(identifier)) {
        return locationCache.get(identifier);
    }

    const api = new AviationWeatherApi();
    const navaid = (await api.fetchNavaids([identifier]))[0];
    if (!navaid) {
        return undefined;
    }

    const location = {
        position: new Point(navaid.lon, navaid.lat, navaid.elev),
        identifier: navaid.id,
        title: navaid.name,
        mag_dec: navaid.mag_dec,
        freq_khz: navaid.freq_unit === "kHz" ? navaid.freq : navaid.freq * 1000,
    };

    locationCache.set(identifier, location);
    return location;
}

/**
 * Will try fetch airport waypoint data from API. Will also use caching.
 */
export async function getAirportLocationData(identifier: string): Promise<MissionGeneratorLocation | undefined> {
    if (locationCache.has(identifier)) {
        return locationCache.get(identifier);
    }

    const api = new AviationWeatherApi();
    const airport = (await api.fetchAirports([identifier]))[0];
    if (!airport) {
        return undefined;
    }

    const location = {
        position: new Point(airport.lon, airport.lat, airport.elev),
        identifier: airport.icaoId,
        title: airport.name,
        mag_dec: airport.magdec,
    };

    locationCache.set(identifier, location);
    return location;
}

/**
 * Will try fetch fix waypoint / location data from API. Will also use caching.
 */
export async function getFixLocationData(identifier: string): Promise<MissionGeneratorLocation | undefined> {
    if (locationCache.has(identifier)) {
        return locationCache.get(identifier);
    }

    const api = new AviationWeatherApi();
    const fix = (await api.fetchFix([identifier]))[0];
    if (!fix) {
        return undefined;
    }

    const location = {
        position: new Point(fix.lon, fix.lat),
        identifier: fix.id,
    };

    locationCache.set(identifier, location);
    return location;
}

/**
 * Used for flight briefings: Get waypoint / location name or identifier,
 * as well as navigational aid frequency.
 */
export function getLocationFullName(location: MissionGeneratorLocation): string {
    return (
        location.title ??
        location.identifier +
            (location.freq_khz
                ? location.freq_khz > 1000
                    ? ` (${numberFormat(location.freq_khz, 2)} kHz)`
                    : ` (${numberFormat(location.freq_khz / 1000)} MHz)`
                : "")
    );
}
