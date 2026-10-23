import type { Vector } from "@fboes/geojson";
import { UNIT_METER_PER_NM } from "../util/units.js";
import { fmt } from "./format.js";
import { numberFormat } from "./numberFormat.js";

const CARDINAL_DIRECTIONS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
const CARDINAL_DIRECTIONS_ARROWS = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];

export function cardinalDirection(heading: number): string {
    return (
        CARDINAL_DIRECTIONS[Math.round((heading / 360) * CARDINAL_DIRECTIONS.length) % CARDINAL_DIRECTIONS.length] ?? ""
    );
}

export function cardinalDirectionArrow(heading: number): string {
    return (
        CARDINAL_DIRECTIONS_ARROWS[
            Math.round((heading / 360) * CARDINAL_DIRECTIONS_ARROWS.length) % CARDINAL_DIRECTIONS_ARROWS.length
        ] ?? ""
    );
}

function formatDistance(distance_m: number): string {
    const distance_nm = distance_m / UNIT_METER_PER_NM;
    return numberFormat(distance_nm, distance_nm > 10 || distance_nm % 1 === 0 ? 0 : 1) + " NM";
}

/**
 * @param onSite as fallback for distances less than 1 NM
 * @returns e.g. `8NM to the north`
 */
export function asVectorString(vector: Vector, onSite: string = "on field"): string {
    if (vector.meters < UNIT_METER_PER_NM) {
        return onSite;
    }

    return fmt(`{{distance}} to the {{direction}}`, {
        distance: formatDistance(vector.meters),
        direction: cardinalDirection(vector.bearing),
    });
}
