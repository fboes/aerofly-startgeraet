import { z } from "zod";
import * as ExportFileWriter from "../io/ExportFileWriter.js";
import * as ImportFileReader from "../io/ImportFileReader.js";

export function longitude(): z.ZodNumber {
    return z.number().gte(-180).lte(180).describe("Longitude as decimal representation in WGS84");
}

export function latitude(): z.ZodNumber {
    return z.number().gte(-90).lte(90).describe("Latitude as decimal representation in WGS84");
}

export function degree(): z.ZodNumber {
    return z.number().nonnegative().lt(360).describe("Degree as decimal representation");
}

/**
 * Create a Zod validator which allows for numbers between [0,1]
 */
export function normalized(): z.ZodNumber {
    return z.number().nonnegative().lte(1);
}

/**
 * Create a Zod validator for ICAO aiports IDs, navaid IDs, fixes and wapoint names.
 */
export function identifier(): z.ZodString {
    return z
        .string()
        .uppercase()
        .regex(/^[A-Z0-9-]+$/)
        .min(2)
        .max(8);
}

export function waypointType(): z.ZodEnum {
    return z.enum([
        "origin",
        "departure_runway",
        "departure",
        "waypoint",
        "arrival",
        "approach",
        "destination_runway",
        "destination",
    ]);
}

export function aircraft(): z.ZodString {
    return z
        .string()
        .lowercase()
        .regex(/^[a-z0-9-_]+$/)
        .min(1)
        .max(8);
}

export function configuration(): z.ZodEnum {
    return z.enum(["Keep", "OnGround", "Cruise"]);
}

export function airport(): z.ZodObject<{
    identifier: z.ZodString;
    longitude: z.ZodNumber;
    latitude: z.ZodNumber;
    elevation_ft: z.ZodOptional<z.ZodNumber>;
}> {
    return z.object({
        identifier: identifier().describe(`ICAO identifier of airport`),
        longitude: longitude(),
        latitude: latitude(),
        elevation_ft: z.number().optional(),
    });
}

export function waypoint(): z.ZodObject<{
    identifier: z.ZodString;
    longitude: z.ZodNumber;
    latitude: z.ZodNumber;
    altitude_ft: z.ZodOptional<z.ZodNumber>;
    flyOver: z.ZodOptional<z.ZodBoolean>;
}> {
    return z.object({
        identifier: identifier(),
        longitude: longitude(),
        latitude: latitude(),
        altitude_ft: z.number().optional(),
        flyOver: z.boolean().optional(),
    });
}

export function runway(): z.ZodObject<{
    identifier: z.ZodString;
    length: z.ZodOptional<z.ZodNumber>;
    elevation_ft: z.ZodOptional<z.ZodNumber>;
    direction_degree: z.ZodOptional<z.ZodNumber>;
}> {
    return z.object({
        identifier: identifier(),
        length: z.number().optional(),
        elevation_ft: z.number().optional(),
        direction_degree: degree().optional(),
    });
}

export function geoCoordinates(): z.ZodObject<{
    longitude: z.ZodNumber;
    latitude: z.ZodNumber;
}> {
    return z.object({
        longitude: longitude(),
        latitude: latitude(),
    });
}

export function geoQuery(): z.ZodObject<{
    longitude: z.ZodNumber;
    latitude: z.ZodNumber;
    radiusKm: z.ZodNumber;
}> {
    return z.object({
        longitude: longitude().describe("Longitude of center point for geo search."),
        latitude: latitude().describe("Latitude of center point for geo search."),
        radiusKm: z.number().positive().describe("Maximum distance in kilometers from center point."),
    });
}

export function exportFileType(): z.ZodEnum {
    return z.enum(ExportFileWriter.EXPORT_FILE_TYPES);
}

export function importFileType(): z.ZodEnum {
    return z.enum(ImportFileReader.IMPORT_FILE_TYPES);
}
