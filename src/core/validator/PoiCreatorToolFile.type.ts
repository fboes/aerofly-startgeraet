import { z } from "zod";

/**
 * @see https://github.com/jlgabriel/afs4-poi-creator/blob/main/src/core/project/types.ts
 */
export const PctFileHeightModeSchema = z.enum(["asl", "terrain", "terrain-offset"]);
export type PctFileHeightMode = z.infer<typeof PctFileHeightModeSchema>;

/**
 * @see https://github.com/jlgabriel/afs4-poi-creator/blob/main/src/core/project/types.ts
 */
export const PctFileHeightSpecSchema = z.object({
    mode: PctFileHeightModeSchema,
    value: z.number().optional(), // absolute metres ASL, user-entered)
});
export type PctFileHeightSpec = z.infer<typeof PctFileHeightSpecSchema>;

/**
 * @see https://github.com/jlgabriel/afs4-poi-creator/blob/main/src/core/project/types.ts
 */
export const PctFileLonLatSchema = z.object({
    lon: z.number(),
    lat: z.number(),
});
export type PctFileLonLat = z.infer<typeof PctFileLonLatSchema>;

/**
 * @see https://github.com/jlgabriel/afs4-poi-creator/blob/main/src/core/project/types.ts
 */
export const PctFileObjectKindSchema = z.enum(["xref", "light", "airport_light", "plant"]);
export type PctFileObjectKind = z.infer<typeof PctFileObjectKindSchema>;

/**
 * @see https://github.com/jlgabriel/afs4-poi-creator/blob/main/src/core/project/types.ts
 */
export const PctFileObjectSchema = z.object({
    id: z.string(), // uuid v4
    position: PctFileLonLatSchema,
    height: PctFileHeightSpecSchema,
    label: z.string().optional(), // optional user note
    locked: z.boolean().optional(), // optional: ignore drags (dense-scene safety)
    kind: PctFileObjectKindSchema,

    // xref
    direction: z.number().optional(), // degrees, clockwise positive, [0, 360) (spec: negative = CCW)
    name: z.string().optional(), // exact catalog name — the value written to the .toc

    // airport_light
    orientation: z.number().optional(), // degrees the light is illuminated toward
    typeName: z.string().optional(), // CatalogAirportLight.typeName — the .toc type_name (no "al_")
});
export type PctFileObject = z.infer<typeof PctFileObjectSchema>;

/**
 * @see https://github.com/jlgabriel/afs4-poi-creator/blob/main/src/core/project/types.ts
 */
export const PctFileSchema = z.object({
    schemaVersion: z.number(),
    app: z.string(),
    objects: z.array(PctFileObjectSchema),
});
export type PctFile = z.infer<typeof PctFileSchema>;
