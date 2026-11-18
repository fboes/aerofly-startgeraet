import { PctFileSchema, type PctFile } from "./PoiCreatorToolFile.type.js";

/**
 * Ensuring that the supplied JSON is a valid POI Creation Tool JSON file
 * and returning it as a `PctFile` object.
 */
export function parsePct(pctJson: unknown): PctFile {
    return PctFileSchema.parse(pctJson);
}
