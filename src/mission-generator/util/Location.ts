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
import type { Location, LocationExtended } from "../util/Location.type.js";
import { Point } from "@fboes/geojson";
import { degreeNormalize } from "../../core/util/degree.js";
import { parsePct } from "../../core/validator/PoiCreatorToolFile.js";
import { parseGeoJson } from "../../core/validator/GeoJson.js";

/**
 * Keeps normalized airports, navigational aids and fixes cached after fetching
 * from API or extracted from flight plan
 */
const locationCache = new Map<string, Location>();

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
): Promise<Location | undefined> {
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
): Promise<Location | undefined> {
    if (locationCache.has(identifier)) {
        return locationCache.get(identifier);
    }

    const location = locations.find((w) => w.identifier === identifier);
    if (location) {
        const locationData: Location = convertAeroflyNavRouteBaseToMissionGeneratorLocation(location);
        locationCache.set(identifier, locationData);
        return locationData;
    }
}

function convertAeroflyNavRouteBaseToMissionGeneratorLocation(wp: AeroflyNavRouteBase): Location {
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
export async function getNavaidLocationData(identifier: string): Promise<Location | undefined> {
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
export async function getAirportLocationData(identifier: string): Promise<Location | undefined> {
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
export async function getFixLocationData(identifier: string): Promise<Location | undefined> {
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
export function getLocationFullName(location: Location): string {
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

/**
 * @returns an array of `LocationExtended` from GeoJSON input
 */
export function parseGeoJsonToLocations(geoJson: unknown): LocationExtended[] {
    const geoJsonObject = parseGeoJson(geoJson);

    return geoJsonObject.features
        .filter((f) => {
            return f.type === "Feature" && f.geometry.type === "Point";
        })
        .map((f, index): LocationExtended => {
            const longitude = f.geometry.coordinates[0] as number | undefined;
            const latitude = f.geometry.coordinates[1] as number | undefined;
            const altitude_m = f.geometry.coordinates[2] as number | undefined;
            if (!longitude || !latitude) {
                throw new Error("Not enough coordinates in GeoJson");
            }

            const direction = f.properties.direction;
            const approaches =
                f.properties.approaches?.map((a) => a) ??
                (direction ? [direction, degreeNormalize(direction + 180)] : undefined);
            const type = f.properties["marker-symbol"];

            return {
                position: new Point(longitude, latitude, altitude_m),
                identifier: f.properties.icaoCode ?? identifierFromNumber(index),
                title: f.properties.title,
                tags: type ? [type] : undefined,
                direction,
                approaches,
            };
        });
}

/**
 * Parses objects from the POI Creator tool. Will ignore objects that do not
 * contain `label` property and are not relevant for the mission generator.
 *
 * @see https://github.com/jlgabriel/afs4-poi-creator
 * @returns an array of `LocationExtended` from POI Creation Tool JSON input
 */
export function parsePctJsonToLocations(pctJson: unknown): LocationExtended[] {
    return parsePct(pctJson)
        .objects.filter((o) => {
            return o.label;
        })
        .map((o, index): LocationExtended => {
            if (!o.label) {
                throw new ErrorDetail("POI object does not have a label", JSON.stringify(o));
            }
            const { title, tags, identifier, approaches } = splitLabel(o.label);

            return {
                position: new Point(o.position.lon, o.position.lat, o.height.value),
                identifier: identifier ?? identifierFromNumber(index),
                title,
                tags,
                direction: o.direction,
                approaches: approaches ?? (o.direction ? [o.direction, degreeNormalize(o.direction + 180)] : undefined),
            };
        });
}

function splitLabel(label: string): {
    title: string;
    tags: string[];
    identifier?: string;
    approaches?: number[];
} {
    const splitted = label.split(/\s*#/);
    const title = splitted.shift() ?? "";

    let identifier: string | undefined = undefined;
    const approaches: number[] = [];

    splitted
        .filter((s): boolean => /^[A-Za-z]+:/.test(s))
        .forEach((s) => {
            const match = s.match(/^([A-Za-z]+):\s*(.+)$/);
            if (!match || !match[1] || !match[2]) {
                return;
            }

            switch (match[1]) {
                case "id":
                case "icao":
                case "identifier":
                    identifier = match[2].trim();
                    break;
                case "appr":
                case "approach":
                case "approaches":
                    approaches.push(degreeNormalize(Number(match[2])));
                    break;
            }
        });

    return {
        title,
        tags: splitted,
        identifier,
        approaches,
    };
}

function identifierFromNumber(index: number): string {
    return `WP-${index.toString().padStart(3, "0")}`;
}
