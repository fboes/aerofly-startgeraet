import type { JsonSchemaObject, JsonSchemaType } from "./JsonSchema.type.js";

/**
 * Describes the purpose of a Mission Generator to the user
 */
export type MissionGeneratorManifest = {
    /**
     * Technical identifier, the name cannot contain any non-URL-safe characters.
     */
    name: string;
    /**
     * Plain text, brief name
     */
    displayName: string;
    /**
     * Single-line description.
     */
    description: string;
    /**
     * Multi-line, extended description. If in doubt use Markdown.
     */
    longDescription: string;
    /**
     * SEM ver, e.g. "2.0.0"
     */
    version: string;
    /**
     * Configuration fields (can be converted into form elements)
     */
    configuration?: MissionGeneratorManifestField[];
};

export type MissionGeneratorManifestField = JsonSchemaObject & {
    name: string;
    type: JsonSchemaType;
    isRequired: boolean;
};

export type MissionGeneratorWaypoint<T extends Record<string, unknown> | undefined = undefined> = {
    longitude: number;
    latitude: number;

    /**
     * Altitude in meters
     */
    altitude_m?: number;

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

    /**
     * Custom payload
     */
    payload?: T;
};
