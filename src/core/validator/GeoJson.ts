import { z } from "zod";

/**
 * @see https://github.com/mapbox/simplestyle-spec
 */
export const GeoJsonFeaturePropertiesSchema = z.object({
    // Simplestyle spec
    title: z.string().optional(),
    description: z.string().optional(),
    "marker-symbol": z.string().optional(),

    // other properties
    direction: z.number().optional(),
    approaches: z.array(z.number()).optional(),
    icaoCode: z.string().optional(),
    type: z.string().optional(),
});
export type GeoJsonFeatureProperties = z.infer<typeof GeoJsonFeaturePropertiesSchema>;

export const GeoJsonCoordinates = z.array(z.number()).min(2).max(3);
export const GeoJsonFeatureSchema = z.object({
    type: z.string(),
    geometry: z.object({
        type: z.string(),
        coordinates: z.union([GeoJsonCoordinates, z.array(GeoJsonCoordinates)]),
    }),
    properties: GeoJsonFeaturePropertiesSchema,
});
export type GeoJsonFeature = z.infer<typeof GeoJsonFeatureSchema>;

export const GeoJsonSchema = z.object({
    type: z.literal("FeatureCollection"),
    features: z.array(GeoJsonFeatureSchema),
});
export type GeoJson = z.infer<typeof GeoJsonSchema>;

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Ensuring that the supplied JSON is a valid GeoJSON
 */
export function parseGeoJson(geoJson: unknown): GeoJson {
    return GeoJsonSchema.parse(geoJson);
}
