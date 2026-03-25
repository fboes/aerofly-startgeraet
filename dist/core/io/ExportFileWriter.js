import fs from "node:fs";
import { ExportFileAeroflyMainMcfExport } from "../converter/ExportFileAeroflyMainMcfConverter.js";
import { ExportFileAeroflyCustomMissionsTmcConverter } from "../converter/ExportFileAeroflyCustomMissionsTmcConverter.js";
/**
 * Writes a file from an `AeroflyFlight` class instance to an
 * external flight plan file by selecting the appropriate converter.
 */
export class ExportFileWriter {
    static exportFlightplanToFile(filename, flightplan) {
        const converter = this.getConverter(filename);
        const content = new converter().convert(flightplan);
        fs.writeFileSync(filename, content, "utf8");
    }
    static getConverter(filename) {
        const fileSuffix = filename.split(".").pop()?.toLowerCase();
        if (!fileSuffix) {
            throw new Error(`Could not determine file type for "${filename}"`);
        }
        const registry = {
            [ExportFileAeroflyMainMcfExport.fileExtension]: ExportFileAeroflyMainMcfExport,
            [ExportFileAeroflyCustomMissionsTmcConverter.fileExtension]: ExportFileAeroflyCustomMissionsTmcConverter,
        };
        const converter = registry[fileSuffix];
        if (!converter) {
            throw new Error(`Unsupported file type: ${fileSuffix}`);
        }
        return converter;
    }
}
