import { z } from "zod";

export class ZodExtra {
    static longitude(): z.ZodNumber {
        return z.number().gte(-180).lte(180);
    }

    static latitude(): z.ZodNumber {
        return z.number().gte(-90).lte(90);
    }

    static degree(): z.ZodNumber {
        return z.number().nonnegative().lt(360);
    }

    /**
     * Create a Zod validator which allows for numbers between [0,1]
     */
    static normalized(): z.ZodNumber {
        return z.number().nonnegative().lt(1);
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
}
