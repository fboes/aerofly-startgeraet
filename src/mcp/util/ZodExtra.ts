import { z } from "zod";

export class ZodExtra {
    static longitude(): z.ZodNumber {
        return z.number().gte(-180).lte(180).describe("Longitude as decimal representation in WGS84");
    }

    static latitude(): z.ZodNumber {
        return z.number().gte(-90).lte(90).describe("Latitude as decimal representation in WGS84");
    }

    static degree(): z.ZodNumber {
        return z.number().nonnegative().lt(360).describe("Degree as decimal representation");
    }

    /**
     * Create a Zod validator which allows for numbers between [0,1]
     */
    static normalized(): z.ZodNumber {
        return z.number().nonnegative().lte(1);
    }

    /**
     * Create a Zod validator for ICAO aiports IDs, navaid IDs, fixes and wapoint names.
     */
    static identifier(): z.ZodString {
        return z
            .string()
            .uppercase()
            .regex(/^[A-Z0-9-]+$/)
            .min(2)
            .max(8);
    }

    static waypointType(): z.ZodEnum {
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

    static aircraft(): z.ZodString {
        return z
            .string()
            .lowercase()
            .regex(/^[a-z0-9-_]+$/)
            .min(1)
            .max(8);
    }

    static configuration(): z.ZodEnum {
        return z.enum(["Keep", "OnGround", "Cruise"]);
    }

    static airport(): z.ZodObject<{
        identifier: z.ZodString;
        longitude: z.ZodNumber;
        latitude: z.ZodNumber;
        elevation_ft: z.ZodOptional<z.ZodNumber>;
    }> {
        return z.object({
            identifier: this.identifier().describe(`ICAO identifier of airport`),
            longitude: this.longitude(),
            latitude: this.latitude(),
            elevation_ft: z.number().optional(),
        });
    }

    static waypoint(): z.ZodObject<{
        identifier: z.ZodString;
        longitude: z.ZodNumber;
        latitude: z.ZodNumber;
        altitude_ft: z.ZodOptional<z.ZodNumber>;
        flyOver: z.ZodOptional<z.ZodBoolean>;
    }> {
        return z.object({
            identifier: this.identifier(),
            longitude: this.longitude(),
            latitude: this.latitude(),
            altitude_ft: z.number().optional(),
            flyOver: z.boolean().optional(),
        });
    }
}
