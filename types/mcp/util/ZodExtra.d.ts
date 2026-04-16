import { z } from "zod";
export declare class ZodExtra {
    static longitude(): z.ZodNumber;
    static latitude(): z.ZodNumber;
    static degree(): z.ZodNumber;
    /**
     * Create a Zod validator which allows for numbers between [0,1]
     */
    static normalized(): z.ZodNumber;
    /**
     * Create a Zod validator for ICAO aiports IDs, navaid IDs, fixes and wapoint names.
     */
    static identifier(): z.ZodString;
    static waypointType(): z.ZodEnum;
    static aircraft(): z.ZodString;
    static configuration(): z.ZodEnum;
    static airport(): z.ZodObject<{
        identifier: z.ZodString;
        longitude: z.ZodNumber;
        latitude: z.ZodNumber;
        elevation_ft: z.ZodOptional<z.ZodNumber>;
    }>;
    static waypoint(): z.ZodObject<{
        identifier: z.ZodString;
        longitude: z.ZodNumber;
        latitude: z.ZodNumber;
        altitude_ft: z.ZodOptional<z.ZodNumber>;
        flyOver: z.ZodOptional<z.ZodBoolean>;
    }>;
    static runway(): z.ZodObject<{
        identifier: z.ZodString;
        length: z.ZodOptional<z.ZodNumber>;
        elevation_ft: z.ZodOptional<z.ZodNumber>;
        direction_degree: z.ZodOptional<z.ZodNumber>;
    }>;
}
//# sourceMappingURL=ZodExtra.d.ts.map
