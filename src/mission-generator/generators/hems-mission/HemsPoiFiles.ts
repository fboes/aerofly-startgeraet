import { Vector, type Point } from "@fboes/geojson";
import { AeroflyPoiFiles, type AeroflyPoiLight, type AeroflyPoiXref } from "../../util/AeroflyPoiFiles.js";
import type { HemsMissionLocation } from "./HemsMissionLocations.js";

/**
 * @param slug
 * @param locations
 * @returns the new definition of the POI files for the given slug and locations
 */
export function createHemsPoiFiles(slug: string, locations: HemsMissionLocation[]): AeroflyPoiFiles {
    return new AeroflyPoiFiles(slug, xrefFromLocations(locations), lightsFromLocations(locations));
}

// -----------------------------------------------------------------------------

function xrefFromLocations(locations: HemsMissionLocation[]): AeroflyPoiXref[] {
    return locations.map(xrefFromLocation).flatMap((xref) => xref);
}

function xrefFromLocation(location: HemsMissionLocation): AeroflyPoiXref[] {
    // TODO: Currently this only maps emergency waypoints
    const direction = location.payload.direction ?? 0;
    return [
        {
            position: location.payload.point,
            direction,
            name: "ambulance",
        },
        {
            position: policeCarVector(location.payload.point, direction),
            direction,
            name: "police_car",
        },
    ];
}

// -----------------------------------------------------------------------------

function lightsFromLocations(locations: HemsMissionLocation[]): AeroflyPoiLight[] {
    return locations.map(lightsFromLocation).flatMap((light) => light);
}

function lightsFromLocation(location: HemsMissionLocation): AeroflyPoiLight[] {
    // TODO: Currently this only maps emergency waypoints
    const direction = location.payload.direction ?? 0;
    return [
        {
            position: location.payload.point,
            height: 3,
            color: [0, 0, 1],
            flashing: [10, 0, 100, 0],
            groupIndex: 3,
        },
        {
            position: policeCarVector(location.payload.point, direction),
            height: 1.7,
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
