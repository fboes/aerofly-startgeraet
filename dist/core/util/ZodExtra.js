import { z } from "zod";
export class ZodExtra {
    static longitude() {
        return z.number().gte(-180).lte(180).describe("Longitude as decimal representation in WGS84");
    }
    static latitude() {
        return z.number().gte(-90).lte(90).describe("Latitude as decimal representation in WGS84");
    }
    static degree() {
        return z.number().nonnegative().lt(360).describe("Degree as decimal representation");
    }
    /**
     * Create a Zod validator which allows for numbers between [0,1]
     */
    static normalized() {
        return z.number().nonnegative().lte(1);
    }
    /**
     * Create a Zod validator for ICAO aiports IDs, navaid IDs, fixes and wapoint names.
     */
    static identifier() {
        return z
            .string()
            .uppercase()
            .regex(/^[A-Z0-9-]+$/)
            .min(2)
            .max(8);
    }
    static waypointType() {
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
    static aircraft() {
        return z
            .string()
            .lowercase()
            .regex(/^[a-z0-9-_]+$/)
            .min(1)
            .max(8);
    }
    static configuration() {
        return z.enum(["Keep", "OnGround", "Cruise"]);
    }
    static airport() {
        return z.object({
            identifier: this.identifier().describe(`ICAO identifier of airport`),
            longitude: this.longitude(),
            latitude: this.latitude(),
            elevation_ft: z.number().optional(),
        });
    }
    static waypoint() {
        return z.object({
            identifier: this.identifier(),
            longitude: this.longitude(),
            latitude: this.latitude(),
            altitude_ft: z.number().optional(),
            flyOver: z.boolean().optional(),
        });
    }
    static runway() {
        return z.object({
            identifier: this.identifier(),
            length: z.number().optional(),
            elevation_ft: z.number().optional(),
            direction_degree: this.degree().optional(),
        });
    }
    static geoQuery() {
        return z.object({
            longitude: ZodExtra.longitude().describe("Longitude of center point for geo search."),
            latitude: ZodExtra.latitude().describe("Latitude of center point for geo search."),
            radiusKm: z.number().positive().describe("Maximum distance in kilometers from center point."),
        });
    }
}
