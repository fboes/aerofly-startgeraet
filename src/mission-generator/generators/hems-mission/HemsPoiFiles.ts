import {
    AeroflyPoiFiles,
    type AeroflyPoiAirportLight,
    type AeroflyPoiLight,
    type AeroflyPoiXref,
} from "../../util/AeroflyPoiFiles.js";
import { setLocationElevationFromApi } from "../../util/setElevation.js";
import type { LocationExtended } from "../../util/Location.type.js";
import { HemsMissionLocations } from "./HemsMissionLocations.js";

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
    const direction = location.direction ?? 0;
    const type = typeOfLocation(location);
    return [
        {
            position: location.position,
            direction,
            name: typeSwitch<string>(type, { emergency: "ambulance" }) ?? "helipad",
            label: label(location),
        },
    ];
}

function label(location: LocationExtended): string | undefined {
    const tags: string[] = [location.title ?? "", ...(location.tags ?? []).map((tag) => `#${tag}`)];

    if (location.approaches) {
        tags.push(...location.approaches.map((a) => `#approach:${a.toFixed(0)}`));
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
    const type = typeOfLocation(location);
    return (
        typeSwitch<AeroflyPoiLight[]>(type, {
            emergency: [
                {
                    position: location.position,
                    heightAdjust: 3,
                    color: [0, 0, 1],
                    intensity: 100,
                    flashing: [10, 0, 100, 0],
                    groupIndex: 3,
                },
            ],
        }) ?? []
    );
}

// -----------------------------------------------------------------------------
export function airportLightsFromLocation(locations: LocationExtended[]): AeroflyPoiAirportLight[] {
    return locations.map(airportLightFromLocation).flatMap((light) => light);
}

function airportLightFromLocation(location: LocationExtended): AeroflyPoiAirportLight[] {
    return (
        typeSwitch<AeroflyPoiAirportLight[]>(typeOfLocation(location), {
            emergency: [],
        }) ?? []
    );
}

// -----------------------------------------------------------------------------

function typeOfLocation(location: LocationExtended): "emergency" | "hospital" | "heliport" {
    if (
        location.tags?.includes(HemsMissionLocations.TYPE_HOSPITAL) ||
        location.tags?.includes(HemsMissionLocations.TYPE_HOSPITAL_HELIPORT)
    ) {
        return "hospital";
    }
    if (location.tags?.includes(HemsMissionLocations.TYPE_HELIPORT)) {
        return "heliport";
    }
    return "emergency";
}

function typeSwitch<T>(typeOfLocation: string, returnValue: Record<string, T>): T | undefined {
    return returnValue[typeOfLocation];
}
