import type { Point } from "@fboes/geojson";

export type AeroflyPoiLight = {
    position: Point;
    /**
     * above ground level in meters, default 1
     */
    height?: number;
    /**
     * R, G, B
     */
    color: [number, number, number];
    /**
     * 0 - 1000
     */
    intensity?: number;
    /**
     * Cycle, Sequence, Length, Offset
     */
    flashing?: [number, number, number, number];
    /**
     * 0: only at night - 3: always on
     */
    groupIndex?: 0 | 1 | 2 | 3;
};

export type AeroflyPoiXref = {
    name: string;
    direction?: number;
    position: Point;
};

/**
 * Serves to create simple POI files for the mission generator. These files can
 * be read by Aerofly FS and will display objects and lights in the simulator.
 */
export class AeroflyPoiFiles {
    constructor(
        public slug: string,
        public xref: AeroflyPoiXref[] = [],
        public lights: AeroflyPoiLight[] = [],
    ) {}

    // -------------------------------------------------------------------------

    private tocXrefContents(): string[] {
        return this.xref.map((xref, index) => {
            return `\
            <[xref][element][${index}]
                <[string8u][name][${xref.name}]>
                <[vector3_float64][position][${xref.position.longitude} ${xref.position.latitude} 0]>
                <[float64][direction][${xref.direction}]>
                <[float32][scale_factor][1]>
            >`;
        });
    }

    tocLightContents(): string[] {
        return this.lights.map((light, index) => {
            return `\
            <[light][element][${index}]
                <[vector3_float64][position][${light.position.longitude} ${light.position.latitude} ${light.height ?? 1}]>
                <[vector3_float32][color][${light.color.join(" ")}]>
                <[float32][intensity][${light.intensity ?? 100}]>
                <[vector4_float32][flashing][${(light.flashing ?? []).join(" ")}]>
                <[uint32][group_index][${light.groupIndex ?? 1}]>
            >`;
        });
    }

    tocFileContent(): string {
        return `\
<[file][][]
    <[cultivation][][]
        <[string8][coordinate_system][lonlat]>
        <[list_light][light_list][]
${this.tocLightContents().join("\n")}
        >
        <[list_xref][xref_list][]
${this.tocXrefContents().join("\n")}
        >
    >
>`;
    }

    // -------------------------------------------------------------------------

    private tslObjectsContents(): string {
        const xref = this.xref[0];
        if (!xref) {
            return "";
        }
        return `\
        <[list_tmsimulator_scenery_object][objects][]
            <[tmsimulator_scenery_object][element][0]
                <[string8u][type][object]>
                <[string8][geometry][fallback/fallback]>
                <[vector3_float64][position][${xref.position.longitude} ${xref.position.latitude} -1.0]>
                <[int32][autoheight_override][-1]>
            >`;
    }

    tslFileContent(): string {
        return `\
<[file][][]
    <[tmsimulator_scenery_place_simple][][]
        <[string8u][coordinate_system][lonlat]>
        <[bool][autoheight][true]>
        <[string8u][cultivation][${this.slug}]> # TOC file
        <[list_tmsimulator_scenery_object][objects][]
${this.tslObjectsContents()}
        >
    >
>
`;
    }
}
