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
}
//# sourceMappingURL=ZodExtra.d.ts.map
