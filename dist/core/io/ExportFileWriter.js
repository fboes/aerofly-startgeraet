import fs from "node:fs";
import { AeroflyFlightToAeroflyMainMcfConverter } from "../converter/aerofly-flight/AeroflyFlightToAeroflyMainMcfConverter.js";
import { AeroflyFlightToAeroflyCustomMissionsTmcConverter } from "../converter/aerofly-flight/AeroflyFlightToAeroflyCustomMissionsTmcConverter.js";
import { AeroflyFlightToGeoJsonConverter } from "../converter/aerofly-flight/AeroflyFlightToGeoJsonConverter.js";
import { AeroflyFlightToKmlConverter } from "../converter/aerofly-flight/AeroflyFlightToKmlConverter.js";
/**
 * Writes a file from an `AeroflyFlight` class instance to an
 * external flight plan file by selecting the appropriate converter.
 */
export class ExportFileWriter {
    static fileTypes = [
        AeroflyFlightToAeroflyMainMcfConverter.fileExtension,
        AeroflyFlightToAeroflyCustomMissionsTmcConverter.fileExtension,
        AeroflyFlightToGeoJsonConverter.fileExtension,
        AeroflyFlightToKmlConverter.fileExtension,
    ];
    static exportFlightplanToString(filename, flightplan) {
        const converter = this.getConverter(filename);
        return new converter().convert(flightplan);
    }
    static exportFlightplanToFile(filename, flightplan) {
        const content = ExportFileWriter.exportFlightplanToString(filename, flightplan);
        fs.writeFileSync(filename, content, "utf8");
    }
    static getConverter(filename) {
        const fileSuffix = filename.split(".").pop()?.toLowerCase();
        if (!fileSuffix) {
            throw new Error(`Could not determine file type for "${filename}"`);
        }
        const registry = this.getRegistry();
        const converter = registry[fileSuffix];
        if (!converter) {
            throw new Error(`Unsupported file type: ${fileSuffix}`);
        }
        return converter;
    }
    static getRegistry() {
        return {
            [AeroflyFlightToAeroflyMainMcfConverter.fileExtension]: AeroflyFlightToAeroflyMainMcfConverter,
            [AeroflyFlightToAeroflyCustomMissionsTmcConverter.fileExtension]: AeroflyFlightToAeroflyCustomMissionsTmcConverter,
            [AeroflyFlightToGeoJsonConverter.fileExtension]: AeroflyFlightToGeoJsonConverter,
            [AeroflyFlightToKmlConverter.fileExtension]: AeroflyFlightToKmlConverter,
        };
    }
}
