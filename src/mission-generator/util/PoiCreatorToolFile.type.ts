export type PctFile = {
    schemaVersion: number;
    app: string;
    objects: PctFileObject[];
};

/**
 * @see https://github.com/jlgabriel/afs4-poi-creator/blob/main/src/core/project/types.ts
 */
export type PctFileObject = {
    id: string; // uuid v4
    position: PctFileLonLat;
    height: PctFileHeightSpec;
    label?: string; // optional user note
    locked?: boolean; // optional: ignore drags (dense-scene safety)
    kind: PctFileObjectKind;

    // xref
    direction?: number; // degrees, clockwise positive, [0, 360) (spec: negative = CCW)
    name?: string; // exact catalog name — the value written to the .toc

    // airport-light
    orientation?: number; // degrees the light is illuminated toward
    typeName?: string; // CatalogAirportLight.typeName — the .toc type_name (no "al_")
};

export type PctFileObjectKind = "xref" | "light" | "airport-light" | "plant";

/**
 * @see https://github.com/jlgabriel/afs4-poi-creator/blob/main/src/core/project/types.ts
 */
export type PctFileHeightSpec = {
    mode: PctFileHeightMode;
    value?: number; // absolute metres ASL, user-entered)
};

export type PctFileHeightMode = "asl" | "terrain" | "terrain-offset";

/**
 * @see https://github.com/jlgabriel/afs4-poi-creator/blob/main/src/core/project/types.ts
 */
export type PctFileLonLat = {
    lon: number;
    lat: number;
};
