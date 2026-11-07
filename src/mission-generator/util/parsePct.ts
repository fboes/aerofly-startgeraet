import { asJSONArray, asJSONNumber, asJSONObject, asJSONString } from "../../core/converter/parser/parseJSON.js";

export type PctFile = {
    schemaVersion: number;
    app: string;
    objects: unknown[];
};

export type PctFileXref = {
    id: string;
    kind: string;
    name: string;
    position: {
        lon: number;
        lat: number;
    };
    height: {
        mode: string;
        value?: number;
    };
    direction: number;
    scale: number;
    label: string;
};

/**
 * Ensuring that the supplied JSON is a valid POI Creation Tool JSON file
 * and returning it as a `PctFile` object.
 */
export function parsePct(pctJson: unknown): PctFile {
    const pctJsonObject = asJSONObject(pctJson);

    if (pctJsonObject.schemaVersion !== 1 || pctJsonObject.app !== "pct") {
        throw new Error("Supplied JSON is no compatible POI Creation Tool JSON");
    }

    const schemaVersion = asJSONNumber(pctJsonObject.schemaVersion);
    const app = asJSONString(pctJsonObject.app);
    const objects = asJSONArray(pctJsonObject.objects);

    return {
        schemaVersion,
        app,
        objects,
    };
}

/**
 * Parses XREF objects from the POI Creator tool. Will ignore all other
 * objects, as the do not contain `label` property and are not relevant for the
 * mission generator.
 */
export function parsePctXrefs(pctFile: PctFile): PctFileXref[] {
    return pctFile.objects
        .filter((o) => {
            return asJSONObject(o).kind === "xref";
        })
        .map((o): PctFileXref => {
            const oObject = asJSONObject(o);
            const position = asJSONObject(oObject.position, "o.position");
            const height = asJSONObject(oObject.height ?? {}, "o.height");

            return {
                id: asJSONString(oObject.id),
                name: asJSONString(oObject.name, "o.name"),
                kind: asJSONString(oObject.kind, "o.kind"),
                position: {
                    lon: asJSONNumber(position.lon, "o.position.lon"),
                    lat: asJSONNumber(position.lat, "o.position.lat"),
                },
                height: {
                    mode: asJSONString(height.mode ?? "asl", "o.height.mode"),
                    value: height.value ? asJSONNumber(height.value, "o.height.value") : undefined,
                },
                direction: asJSONNumber(oObject.direction ?? 0, "o.direction"),
                scale: asJSONNumber(oObject.scale ?? 1, "o.scale"),
                label: asJSONString(oObject.label ?? "", "o.label"),
            };
        });
}
