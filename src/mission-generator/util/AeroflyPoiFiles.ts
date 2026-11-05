import type { Point } from "@fboes/geojson";

export type AeroflyPoiLight = {
    position: Point;
    /**
     * above ground level in meters, default 1
     */
    heightAdjust?: number;
    /**
     * R, G, B, [0,1]
     */
    color: [number, number, number];
    /**
     * [0,1000]
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
    label?: string;
};

export type AeroflyPoiXref = {
    /**
     * XREF object reference
     */
    name: string;
    /**
     * [0,360]
     */
    direction?: number;
    position: Point;
    /**
     * above ground level in meters, default 1
     */
    heightAdjust?: number;
    label?: string;
};

/**
 * Serves to create simple POI files for the mission generator. These files can
 * be read by Aerofly FS and will display objects and lights in the simulator.
 *
 * Credits to [ApfelFlieger](https://www.aerofly.com/community/index.php?user/58802-apfelflieger/)
 * & [Jugac64](https://www.aerofly.com/community/index.php?user/67428-jugac64/)
 * for the kickstarter to this implementation.
 *
 * @see https://github.com/jlgabriel/afs4-poi-creator/
 */
export class AeroflyPoiFiles {
    public readonly slug: string;

    constructor(
        slug: string,
        public xref: AeroflyPoiXref[] = [],
        public lights: AeroflyPoiLight[] = [],
        public isAutoHeight: boolean = false,
    ) {
        this.slug = slug.trim().replace(/[^A-Za-z0-9_\-]/gv, "");
    }

    /**
     * @param point holding coordinates
     * @param slug
     * @returns something like `e01045n5324_slug`
     */
    static poiFolderName(point: Point, slug: string): string {
        return (
            (point.longitude > 0 ? "e" : "w") +
            String(Math.abs(Math.round(point.longitude * 100))).padStart(5, "0") +
            (point.latitude > 0 ? "n" : "s") +
            String(Math.abs(Math.round(point.latitude * 100))).padStart(4, "0") +
            (slug ? "_" + slug.trim().replace(/[^A-Za-z0-9_\-]/gv, "") : "")
        );
    }

    // -------------------------------------------------------------------------

    private tocXrefContents(): string[] {
        return this.xref.map((xref, index) => {
            const height = this.isAutoHeight ? 0 : (xref.position.elevation ?? 0) + (xref.heightAdjust ?? 1);
            return `\
            <[xref][element][${index}]
                <[string8u][name][${xref.name}]>
                <[vector3_float64][position][${xref.position.longitude} ${xref.position.latitude} ${height}]>
                <[float64][direction][${xref.direction}]>
                <[float32][scale_factor][1]>
            >`;
        });
    }

    tocLightContents(): string[] {
        return this.lights.map((light, index) => {
            const height = (light.position.elevation ?? 0) + (light.heightAdjust ?? 1);
            return `\
            <[light][element][${index}]
                <[vector3_float64][position][${light.position.longitude} ${light.position.latitude} ${height}]>
                <[vector3_float32][color][${light.color.join(" ")}]>
                <[float32][intensity][${light.intensity ?? 100}]>
                <[vector4_float32][flashing][${(light.flashing ?? [0, 0, 0, 0]).join(" ")}]>
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
            >
        >
`;
    }

    tslFileContent(): string {
        return `\
<[file][][]
    <[tmsimulator_scenery_place_simple][][]
        <[string8u][coordinate_system][lonlat]>
        <[bool][autoheight][${this.isAutoHeight ? "true" : "false"}]>
        <[string8u][cultivation][${this.slug}]> # TOC file
${this.isAutoHeight ? this.tslObjectsContents() : ""}\
    >
>
`;
    }
}
