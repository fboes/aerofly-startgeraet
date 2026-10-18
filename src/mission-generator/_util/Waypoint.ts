import type { AeroflyNavRouteBase } from "@fboes/aerofly-custom-missions";
import { AviationWeatherApi } from "../../core/api/AviationWeatherApi.js";
import { numberFormat } from "../../core/formatter/numberFormat.js";
import { ErrorFormatted } from "../../core/util/ErrorFormatted.js";
import type { MissionGeneratorWaypoint } from "../MissionGenerator.type.js";

/**
 * Keeps normalized airports, navigational aids and fixes cached after fetching
 * from API or extracted from flight plan
 */
const waypointCache = new Map<string, MissionGeneratorWaypoint>();

/**
 * Will try to extract waypoint by identifier from flight plan, or ask
 * API to get waypoint data. Will also use caching.
 *
 * @see getFlightplanWaypointData
 * @see getNavaidWaypointData
 * @see getAirportWaypointData
 * @see getFixWaypointData
 */
export async function getWaypointData(
    identifier: string,
    waypoints: AeroflyNavRouteBase[] = [],
): Promise<MissionGeneratorWaypoint | undefined> {
    if (waypoints) {
        const aerofly = await getFlightplanWaypointData(identifier, waypoints);
        if (aerofly) {
            return aerofly;
        }
    }

    switch (identifier.length) {
        case 2:
        case 3:
            return await getNavaidWaypointData(identifier);
        case 4:
            return await getAirportWaypointData(identifier);
        case 5:
            return await getFixWaypointData(identifier);
    }

    throw new ErrorFormatted("Did not find data for waypoint identifier: {{ identifier }}", { identifier });
}

/**
 * Will try to extract waypoint by identifier from flight plan
 * Will also use caching.
 */
export async function getFlightplanWaypointData(
    identifier: string,
    waypoints: AeroflyNavRouteBase[],
): Promise<MissionGeneratorWaypoint | undefined> {
    if (waypointCache.has(identifier)) {
        return waypointCache.get(identifier);
    }

    const waypoint = waypoints.find((w) => w.identifier === identifier);
    if (waypoint) {
        waypointCache.set(identifier, waypoint);
        return waypoint;
    }
}

/**
 * Will try fetch navigationall aid waypoint data from API.
 * Will also use caching.
 */
export async function getNavaidWaypointData(identifier: string): Promise<MissionGeneratorWaypoint | undefined> {
    if (waypointCache.has(identifier)) {
        return waypointCache.get(identifier);
    }

    const api = new AviationWeatherApi();
    const navaid = (await api.fetchNavaids([identifier]))[0];
    if (!navaid) {
        return undefined;
    }

    const waypoint = {
        longitude: navaid.lon,
        latitude: navaid.lat,
        identifier: navaid.id,
        title: navaid.name,
        mag_dec: navaid.mag_dec,
        freq_khz: navaid.freq_unit === "kHz" ? navaid.freq : navaid.freq * 1000,
    };

    waypointCache.set(identifier, waypoint);
    return waypoint;
}

/**
 * Will try fetch airport waypoint data from API. Will also use caching.
 */
export async function getAirportWaypointData(identifier: string): Promise<MissionGeneratorWaypoint | undefined> {
    if (waypointCache.has(identifier)) {
        return waypointCache.get(identifier);
    }

    const api = new AviationWeatherApi();
    const airport = (await api.fetchAirports([identifier]))[0];
    if (!airport) {
        return undefined;
    }

    const waypoint = {
        longitude: airport.lon,
        latitude: airport.lat,
        identifier: airport.icaoId,
        title: airport.name,
        mag_dec: airport.magdec,
    };

    waypointCache.set(identifier, waypoint);
    return waypoint;
}

/**
 * Will try fetch fix waypoint data from API. Will also use caching.
 */
export async function getFixWaypointData(identifier: string): Promise<MissionGeneratorWaypoint | undefined> {
    if (waypointCache.has(identifier)) {
        return waypointCache.get(identifier);
    }

    const api = new AviationWeatherApi();
    const fix = (await api.fetchFix([identifier]))[0];
    if (!fix) {
        return undefined;
    }

    const waypoint = {
        longitude: fix.lon,
        latitude: fix.lat,
        identifier: fix.id,
    };

    waypointCache.set(identifier, waypoint);
    return waypoint;
}

/**
 * Used for flight briefings: Get waypoint name or identifier, as well as
 * navigational aid frequency.
 */
export function getWaypointFullName(waypoint: MissionGeneratorWaypoint): string {
    return (
        waypoint.title ??
        waypoint.identifier +
            (waypoint.freq_khz
                ? waypoint.freq_khz > 1000
                    ? ` (${numberFormat(waypoint.freq_khz, 2)} kHz)`
                    : ` (${numberFormat(waypoint.freq_khz / 1000)} MHz)`
                : "")
    );
}
