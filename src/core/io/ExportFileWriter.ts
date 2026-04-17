import fs from "node:fs";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { ExportFileAeroflyMainMcfExport } from "../converter/ExportFileAeroflyMainMcfConverter.js";
import { ExportFileConverter } from "../converter/ExportFileConverter.js";
import { ExportFileAeroflyCustomMissionsTmcConverter } from "../converter/ExportFileAeroflyCustomMissionsTmcConverter.js";
import { ExportFileGeoJsonConverter } from "../converter/ExportFileGeoJsonConverter.js";
import { ExportFileKmlConverter } from "../converter/ExportFileKmlConverter.js";

/**
 * Writes a file from an `AeroflyFlight` class instance to an
 * external flight plan file by selecting the appropriate converter.
 */
export class ExportFileWriter {
    static exportFlightplanToFile(filename: string, flightplan: AeroflyFlight): void {
        const converter = this.getConverter(filename);
        const content = new converter().convert(flightplan);

        fs.writeFileSync(filename, content, "utf8");
    }

    static getConverter(filename: string): new () => ExportFileConverter {
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

    static getRegistry(): Record<string, (new () => ExportFileConverter) | undefined> {
        return {
            [ExportFileAeroflyMainMcfExport.fileExtension]: ExportFileAeroflyMainMcfExport,
            [ExportFileAeroflyCustomMissionsTmcConverter.fileExtension]: ExportFileAeroflyCustomMissionsTmcConverter,
            [ExportFileGeoJsonConverter.fileExtension]: ExportFileGeoJsonConverter,
            [ExportFileKmlConverter.fileExtension]: ExportFileKmlConverter,
        };
    }
}
