import { z } from "zod";

export const OpenTopoDataApiResultItemSchema = z.object({
    /**
     * Elevation, using units and datum from the dataset.
     * For example, the SRTM and ASTER dataset uses meters.
     * May be `null` for `NODATA` values.
     */
    elevation: z.number().nullable(),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
    }),
    /** The name of the dataset which the returned elevation is from. */
    dataset: z.string(),
});
export type OpenTopoDataApiResultItem = z.infer<typeof OpenTopoDataApiResultItemSchema>;

export const OpenTopoDataApiResultSchema = z.object({
    /**
     * List of elevations for each location, in same order as input.
     * Only provided for OK status.
     */
    results: z.array(OpenTopoDataApiResultItemSchema),
    status: z.enum(["OK", "INVALID_REQUEST", "SERVER_ERROR"]),
    error: z.string().optional(),
});
export type OpenTopoDataApiResult = z.infer<typeof OpenTopoDataApiResultSchema>;

export const OpenTopoDataApiCoordinatesSchema = z.object({
    lat: z.number(),
    lng: z.number(),
});
export type OpenTopoDataApiCoordinates = z.infer<typeof OpenTopoDataApiCoordinatesSchema>;
