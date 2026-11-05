import { Vector, type Point } from "@fboes/geojson";
import { AeroflyPoiFiles, type AeroflyPoiLight, type AeroflyPoiXref } from "../../util/AeroflyPoiFiles.js";
import { setLocationElevationFromApi } from "../../util/setElevation.js";
import type { LocationExtended } from "../../util/Location.type.js";

/**
 * @param slug
 * @param locations>
 * @returns the new definition of the POI files for the given slug and locations
 */
export async function createHemsPoiFiles(slug: string, locations: LocationExtended[]): Promise<AeroflyPoiFiles> {
    await setLocationElevationFromApi(locations);
    return new AeroflyPoiFiles(slug, xrefFromLocations(locations), lightsFromLocations(locations));
}

// -----------------------------------------------------------------------------

export function xrefFromLocations(locations: LocationExtended[]): AeroflyPoiXref[] {
    return locations.map(xrefFromLocation).flatMap((xref) => xref);
}

function xrefFromLocation(location: LocationExtended): AeroflyPoiXref[] {
    // TODO: Currently this only maps emergency waypoints
    const direction = location.direction ?? 0;
    return [
        {
            position: location.position,
            direction,
            name: "ambulance",
            label: label(location),
        },
        {
            position: policeCarVector(location.position, direction),
            direction,
            name: "police_car",
        },
    ];
}

function label(location: LocationExtended): string | undefined {
    const tags: string[] = [location.title ?? "", ...(location.tags ?? [])];

    if (location.approaches) {
        tags.push(...location.approaches.map((a) => `#approach:+${a}`));
    }
    if (location.identifier) {
        tags.push(`#icao:${location.identifier}`);
    }

    return tags.join(" ");
}

// -----------------------------------------------------------------------------

export function lightsFromLocations(locations: LocationExtended[]): AeroflyPoiLight[] {
    return locations.map(lightsFromLocation).flatMap((light) => light);
}

function lightsFromLocation(location: LocationExtended): AeroflyPoiLight[] {
    // TODO: Currently this only maps emergency waypoints
    const direction = location.direction ?? 0;
    return [
        {
            position: location.position,
            heightAdjust: 3,
            color: [0, 0, 1],
            flashing: [10, 0, 100, 0],
            groupIndex: 3,
        },
        {
            position: policeCarVector(location.position, direction),
            heightAdjust: 1.7,
            color: [0, 0, 1],
            flashing: [20, 0, 100, 0],
            groupIndex: 3,
        },
    ];
}

// -----------------------------------------------------------------------------

/**
 * @returns
 */
function policeCarVector(point: Point, direction: number): Point {
    return point.getPointBy(new Vector(7, direction));
}
