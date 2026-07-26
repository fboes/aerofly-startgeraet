import { z } from "zod";
export declare function longitude(): z.ZodNumber;
export declare function latitude(): z.ZodNumber;
export declare function degree(): z.ZodNumber;
/**
 * Create a Zod validator which allows for numbers between [0,1]
 */
export declare function normalized(): z.ZodNumber;
/**
 * Create a Zod validator for ICAO aiports IDs, navaid IDs, fixes and wapoint names.
 */
export declare function identifier(): z.ZodString;
export declare function waypointType(): z.ZodEnum;
export declare function aircraft(): z.ZodString;
export declare function configuration(): z.ZodEnum;
export declare function airport(): z.ZodObject<{
    identifier: z.ZodString;
    longitude: z.ZodNumber;
    latitude: z.ZodNumber;
    elevation_ft: z.ZodOptional<z.ZodNumber>;
}>;
export declare function waypoint(): z.ZodObject<{
    identifier: z.ZodString;
    longitude: z.ZodNumber;
    latitude: z.ZodNumber;
    altitude_ft: z.ZodOptional<z.ZodNumber>;
    flyOver: z.ZodOptional<z.ZodBoolean>;
}>;
export declare function runway(): z.ZodObject<{
    identifier: z.ZodString;
    length: z.ZodOptional<z.ZodNumber>;
    elevation_ft: z.ZodOptional<z.ZodNumber>;
    direction_degree: z.ZodOptional<z.ZodNumber>;
}>;
export declare function geoCoordinates(): z.ZodObject<{
    longitude: z.ZodNumber;
    latitude: z.ZodNumber;
}>;
export declare function geoQuery(): z.ZodObject<{
    longitude: z.ZodNumber;
    latitude: z.ZodNumber;
    radiusKm: z.ZodNumber;
}>;
export declare function exportFileType(): z.ZodEnum;
export declare function importFileType(): z.ZodEnum;
export declare function flightConfiguration(): z.ZodEnum;
//# sourceMappingURL=zExtra.d.ts.map