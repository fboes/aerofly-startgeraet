import { z } from "zod";
export class ZodExtra {
    static longitude() {
        return z.number().gte(-180).lte(180);
    }
    static latitude() {
        return z.number().gte(-90).lte(90);
    }
    static degree() {
        return z.number().nonnegative().lt(360);
    }
    /**
     * Create a Zod validator which allows for numbers between [0,1]
     */
    static normalized() {
        return z.number().nonnegative().lt(1);
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
}
