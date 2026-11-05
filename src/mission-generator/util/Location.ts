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
import { asJSONArray, asJSONNumber, asJSONObject, asJSONString } from "../../core/converter/parser/parseJSON.js";
import { degreeNormalize } from "../../core/util/degree.js";

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
    const geoJsonObject = asJSONObject(geoJson);

    return asJSONArray(geoJsonObject.features)
        .filter((f) => {
            const geometry = asJSONObject(f.geometry);
            return asJSONString(f.type) === "Feature" && asJSONString(geometry.type) === "Point";
        })
        .map((f, index): LocationExtended => {
            const geometry = asJSONObject(f.geometry);
            const coordinates = asJSONArray(geometry.coordinates);
            const longitude = asJSONNumber(coordinates[0]);
            const latitude = asJSONNumber(coordinates[1]);
            const altitude_m = coordinates[2] ? asJSONNumber(coordinates[2]) : undefined;

            const properties = asJSONObject(f.properties);
            const direction = properties.direction ? asJSONNumber(properties.direction) : undefined;
            const approaches = properties.approaches
                ? asJSONArray(properties.approaches).map((a) => asJSONNumber(a))
                : direction
                  ? [direction, degreeNormalize(direction + 180)]
                  : undefined;
            const type = properties["marker-symbol"] ? asJSONString(properties["marker-symbol"]) : undefined;

            return {
                position: new Point(longitude, latitude, altitude_m),
                identifier: properties.icaoCode ? asJSONString(properties.icaoCode) : identifierFromNumber(index),
                title: asJSONString(properties.title),
                tags: type ? [type] : undefined,
                direction,
                approaches,
            };
        });
}

/**
 * @see https://github.com/jlgabriel/afs4-poi-creator
 * @returns an array of `LocationExtended` from POI Creation Tool JSON input
 */
export function parsePctJsonToLocations(pctJson: unknown): LocationExtended[] {
    const pctJsonObject = asJSONObject(pctJson);

    if (asJSONNumber(pctJsonObject.schemaVersion) !== 1 || asJSONString(pctJsonObject.app) !== "pct") {
        throw new Error("Supplied JSON is no compatible POI Creation Tool JSON");
    }

    return asJSONArray(pctJsonObject.objects)
        .filter((o) => {
            return o.label;
        })
        .map((o, index): LocationExtended => {
            const position = asJSONObject(o.position);
            const longitude = asJSONNumber(position.lon);
            const latitude = asJSONNumber(position.lat);

            /*
       const height = asJSONObject(o.height);
            const heightMode = asJSONString(o.mode);

            switch (spec.mode) {
    case "asl":
      return spec.value;
    case "terrain":
      return terrainAsl;
    case "terrain-offset":
      return terrainAsl === null ? null : terrainAsl + spec.offset;
  }
            const altitude = null;*/

            const direction = asJSONNumber(o.direction);

            const label = asJSONString(o.label);
            const { title, tags, identifier, approaches } = splitLabel(label);

            return {
                position: new Point(longitude, latitude),
                identifier: identifier ?? identifierFromNumber(index),
                title,
                tags,
                direction,
                approaches: approaches ?? (direction ? [direction, degreeNormalize(direction + 180)] : undefined),
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
