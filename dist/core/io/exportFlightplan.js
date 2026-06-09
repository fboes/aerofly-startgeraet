import fs from "node:fs";
import { AeroflyFlightToAeroflyMainMcfConverter } from "../converter/aerofly-flight/AeroflyFlightToAeroflyMainMcfConverter.js";
import { AeroflyFlightToAeroflyCustomMissionsTmcConverter } from "../converter/aerofly-flight/AeroflyFlightToAeroflyCustomMissionsTmcConverter.js";
import { AeroflyFlightToGeoJsonConverter } from "../converter/aerofly-flight/AeroflyFlightToGeoJsonConverter.js";
import { AeroflyFlightToKmlConverter } from "../converter/aerofly-flight/AeroflyFlightToKmlConverter.js";
import { AeroflyFlightToMarkdownConverter } from "../converter/aerofly-flight/AeroflyFlightToMarkdownConverter.js";
/**
 * Writes a file from an `AeroflyFlight` class instance to an
 * external flight plan file by selecting the appropriate converter.
 */
export const EXPORT_FILE_TYPES = [
    AeroflyFlightToAeroflyMainMcfConverter.fileExtension,
    AeroflyFlightToAeroflyCustomMissionsTmcConverter.fileExtension,
    AeroflyFlightToGeoJsonConverter.fileExtension,
    AeroflyFlightToKmlConverter.fileExtension,
    AeroflyFlightToMarkdownConverter.fileExtension,
];
const EXPORT_REGISTRY = {
    [AeroflyFlightToAeroflyMainMcfConverter.fileExtension]: AeroflyFlightToAeroflyMainMcfConverter,
    [AeroflyFlightToAeroflyCustomMissionsTmcConverter.fileExtension]: AeroflyFlightToAeroflyCustomMissionsTmcConverter,
    [AeroflyFlightToGeoJsonConverter.fileExtension]: AeroflyFlightToGeoJsonConverter,
    [AeroflyFlightToKmlConverter.fileExtension]: AeroflyFlightToKmlConverter,
    [AeroflyFlightToMarkdownConverter.fileExtension]: AeroflyFlightToMarkdownConverter,
};
export function exportFlightplanToString(filename, flightplan) {
    const converter = getExportConverter(filename);
    return new converter().convert(flightplan);
}
export function exportFlightplanToFile(filename, flightplan) {
    const content = exportFlightplanToString(filename, flightplan);
    fs.writeFileSync(filename, content, "utf8");
}
export function getExportConverter(filename) {
    const fileSuffix = filename.split(".").pop()?.toLowerCase();
    if (!fileSuffix) {
        throw new Error(`Could not determine file type for "${filename}"`);
    }
    const converter = EXPORT_REGISTRY[fileSuffix];
    if (!converter) {
        throw new Error(`Unsupported file type: ${fileSuffix}`);
    }
    return converter;
}
