import { z } from "zod";
import * as ExportFileWriter from "../io/exportFlightplan.js";
import * as ImportFileReader from "../io/importFlightplan.js";
export function longitude() {
    return z.number().gte(-180).lte(180).describe("Longitude as decimal representation in WGS84");
}
export function latitude() {
    return z.number().gte(-90).lte(90).describe("Latitude as decimal representation in WGS84");
}
export function degree() {
    return z.number().nonnegative().lt(360).describe("Degree as decimal representation");
}
/**
 * Create a Zod validator which allows for numbers between [0,1]
 */
export function normalized() {
    return z.number().nonnegative().lte(1);
}
/**
 * Create a Zod validator for ICAO aiports IDs, navaid IDs, fixes and wapoint names.
 */
export function identifier() {
    return z
        .string()
        .uppercase()
        .regex(/^[A-Z0-9-]+$/)
        .min(2)
        .max(12);
}
export function waypointType() {
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
export function aircraft() {
    return z
        .string()
        .lowercase()
        .regex(/^[a-z0-9-_]+$/)
        .min(1)
        .max(8);
}
export function configuration() {
    return z.enum(["Keep", "OnGround", "Cruise"]);
}
export function airport() {
    return z.object({
        identifier: identifier().describe(`ICAO identifier of airport`),
        longitude: longitude(),
        latitude: latitude(),
        elevation_ft: z.number().optional(),
    });
}
export function waypoint() {
    return z.object({
        identifier: identifier().describe(`Identifier of waypoint, can be ICAO identifier of airport, navaid or fix, but also any custom name for a user defined waypoint. For custom waypoints use either Place/Bearing/Distance notation, or prefix the waypoint with \`W-\` to avoid conflicts with real world waypoints.`),
        longitude: longitude(),
        latitude: latitude(),
        altitude_ft: z.number().optional(),
        flyOver: z.boolean().optional(),
    });
}
export function runway() {
    return z.object({
        identifier: identifier().describe(`Identifier of runway like 09L, 27R, etc.`),
        length: z.number().optional(),
        elevation_ft: z.number().optional(),
        direction_degree: degree().optional(),
    });
}
export function geoCoordinates() {
    return z.object({
        longitude: longitude(),
        latitude: latitude(),
    });
}
export function geoQuery() {
    return z.object({
        longitude: longitude().describe("Longitude of center point for geo search."),
        latitude: latitude().describe("Latitude of center point for geo search."),
        radiusKm: z.number().positive().describe("Maximum distance in kilometers from center point."),
    });
}
export function exportFileType() {
    return z.enum(ExportFileWriter.EXPORT_FILE_TYPES);
}
export function importFileType() {
    return z.enum(ImportFileReader.IMPORT_FILE_TYPES);
}
const FLIGHT_CONFIGURATION = [
    "Keep",
    "ColdAndDark",
    "BeforeStart", // TODO
    "Parking",
    "OnGround",
    "Takeoff",
    "Cruise",
    "ShortFinal",
    "Final",
];
export function flightConfiguration() {
    return z.enum(FLIGHT_CONFIGURATION);
}
