import { z } from "zod";

export const SimBriefApiPayloadAirportSchema = z.object({
    icao_code: z.string(),
    icao_region: z.string(),
    pos_lat: z.string(),
    pos_long: z.string(),
    /** Feet */
    elevation: z.string(),
    name: z.string(),
    plan_rwy: z.string(),
    metar: z.string(),
    /** Meters */
    metar_visibility: z.string(),
    /** Feet */
    metar_ceiling: z.string(),
    metar_category: z.string(),
});
export type SimBriefApiPayloadAirport = z.infer<typeof SimBriefApiPayloadAirportSchema>;

export const SimBriefApiPayloadNavlogItemSchema = z.object({
    ident: z.string(),
    type: z.enum(["ltlg", "wpt", "vor", "ndb", "apt"]),
    icao_region: z.string(),
    pos_lat: z.string(),
    pos_long: z.string(),
    altitude_feet: z.string(),
    /** Can be in kHz or MHz */
    frequency: z.string(),
});
export type SimBriefApiPayloadNavlogItem = z.infer<typeof SimBriefApiPayloadNavlogItemSchema>;

export const SimBriefApiPayloadFmsDownloadSchema = z.object({
    name: z.string(),
    link: z.string(),
});
export type SimBriefApiPayloadFmsDownload = z.infer<typeof SimBriefApiPayloadFmsDownloadSchema>;

export const SimBriefApiPayloadRunwaySchema = z.object({
    identifier: z.string(),
    /** In feet */
    length: z.string(),
    /** In feet */
    elevation: z.string(),
    true_course: z.string(),
    ils_frequency: z.string(),
});
export type SimBriefApiPayloadRunway = z.infer<typeof SimBriefApiPayloadRunwaySchema>;

const RunwaySetSchema = z.array(SimBriefApiPayloadRunwaySchema);

export const SimBriefApiPayloadSchema = z.object({
    general: z.object({
        /** Feet */
        initial_altitude: z.string(),
        icao_airline: z.string(),
        cruise_tas: z.string(),
        passengers: z.string(),
    }),
    tlr: z.object({
        takeoff: z.object({ runway: RunwaySetSchema }),
        landing: z.object({ runway: RunwaySetSchema }),
    }),
    origin: SimBriefApiPayloadAirportSchema,
    destination: SimBriefApiPayloadAirportSchema,
    navlog: z.array(SimBriefApiPayloadNavlogItemSchema),
    atc: z.object({
        callsign: z.string(),
    }),
    aircraft: z.object({
        icaocode: z.string(),
        reg: z.string(),
    }),
    fuel: z.object({
        plan_ramp: z.string(), // kg
    }),
    times: z.object({
        sched_out: z.string(),
    }),
    weights: z.object({
        payload: z.string(), // kg
    }),
    fms_downloads: z.object({
        directory: z.string(),
        mfs: SimBriefApiPayloadFmsDownloadSchema,
        mfn: SimBriefApiPayloadFmsDownloadSchema,
    }),
});
export type SimBriefApiPayload = z.infer<typeof SimBriefApiPayloadSchema>;

export const SimBriefApiErrorSchema = z.object({
    fetch: z
        .object({
            userid: z.string(),
            static_id: z.string(),
            status: z.string(),
            time: z.string(),
        })
        .optional(),
});
export type SimBriefApiError = z.infer<typeof SimBriefApiErrorSchema>;
