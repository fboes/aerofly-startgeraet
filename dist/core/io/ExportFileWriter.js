import fs from "node:fs";
import { AeroflyFlightToAeroflyMainMcfConverter } from "../converter/aerofly-flight/AeroflyFlightToAeroflyMainMcfConverter.js";
import { AeroflyFlightToAeroflyCustomMissionsTmcConverter } from "../converter/aerofly-flight/AeroflyFlightToAeroflyCustomMissionsTmcConverter.js";
import { AeroflyFlightToGeoJsonConverter } from "../converter/aerofly-flight/AeroflyFlightToGeoJsonConverter.js";
import { AeroflyFlightToKmlConverter } from "../converter/aerofly-flight/AeroflyFlightToKmlConverter.js";
/**
 * Writes a file from an `AeroflyFlight` class instance to an
 * external flight plan file by selecting the appropriate converter.
 */
export const fileTypes = [
    AeroflyFlightToAeroflyMainMcfConverter.fileExtension,
    AeroflyFlightToAeroflyCustomMissionsTmcConverter.fileExtension,
    AeroflyFlightToGeoJsonConverter.fileExtension,
    AeroflyFlightToKmlConverter.fileExtension,
];
export function exportFlightplanToString(filename, flightplan) {
    const converter = getConverter(filename);
    return new converter().convert(flightplan);
}
export function exportFlightplanToFile(filename, flightplan) {
    const content = exportFlightplanToString(filename, flightplan);
    fs.writeFileSync(filename, content, "utf8");
}
export function getConverter(filename) {
    const fileSuffix = filename.split(".").pop()?.toLowerCase();
    if (!fileSuffix) {
        throw new Error(`Could not determine file type for "${filename}"`);
    }
    const registry = getRegistry();
    const converter = registry[fileSuffix];
    if (!converter) {
        throw new Error(`Unsupported file type: ${fileSuffix}`);
    }
    return converter;
}
export function getRegistry() {
    return {
        [AeroflyFlightToAeroflyMainMcfConverter.fileExtension]: AeroflyFlightToAeroflyMainMcfConverter,
        [AeroflyFlightToAeroflyCustomMissionsTmcConverter.fileExtension]: AeroflyFlightToAeroflyCustomMissionsTmcConverter,
        [AeroflyFlightToGeoJsonConverter.fileExtension]: AeroflyFlightToGeoJsonConverter,
        [AeroflyFlightToKmlConverter.fileExtension]: AeroflyFlightToKmlConverter,
    };
}
