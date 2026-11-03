import type { Point } from "@fboes/geojson";

export type Location = {
    /**
     * Elevation is not altitude, but the height above ground level.
     * It is used to determine the height of the object in the simulator.
     */
    position: Point;

    /**
     * ICAO code, nav aid code, fix code, etc.
     */
    identifier: string;
    title?: string;

    freq_khz?: number;

    /**
     * With "+" to the east and "-" to the west. Subtracted from a true heading this will give the magnetic heading.
     */
    mag_dec?: number;
};

export type LocationPayloaded<T extends Record<string, unknown>> = Location & {
    /**
     * Custom payload
     */
    payload: T;
};
