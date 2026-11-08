import { asJSONArray, asJSONNumber, asJSONObject, asJSONString } from "../../core/converter/parser/parseJSON.js";
import type { PctFile, PctFileHeightMode, PctFileObject, PctFileObjectKind } from "./PoiCreatorToolFile.type.js";

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
    const objects = asJSONArray(pctJsonObject.objects).map((o): PctFileObject => {
        const oObject = asJSONObject(o);
        const position = asJSONObject(oObject.position, "o.position");
        const height = asJSONObject(oObject.height ?? {}, "o.height");

        return {
            id: asJSONString(oObject.id),
            kind: asJSONString(oObject.kind, "o.kind") as PctFileObjectKind,
            position: {
                lon: asJSONNumber(position.lon, "o.position.lon"),
                lat: asJSONNumber(position.lat, "o.position.lat"),
            },
            height: {
                mode: asJSONString(height.mode ?? "asl", "o.height.mode") as PctFileHeightMode,
                value: height.value ? asJSONNumber(height.value, "o.height.value") : undefined,
            },
            label: oObject.label ? asJSONString(oObject.label, "o.label") : undefined,

            // xref
            direction: oObject.direction ? asJSONNumber(oObject.direction, "o.direction") : undefined,
            name: oObject.name ? asJSONString(oObject.name, "o.name") : undefined,

            // airport_light
            orientation: oObject.orientation ? asJSONNumber(oObject.orientation, "o.orientation") : undefined,
            typeName: oObject.typeName ? asJSONString(oObject.typeName, "o.typeName") : undefined,
        };
    });

    return {
        schemaVersion,
        app,
        objects,
    };
}
