import fs from "node:fs";
import { AeroflyFlight } from "@fboes/aerofly-custom-missions";
import { AeroflyFlightToAeroflyMainMcfConverter } from "../converter/aerofly-flight/AeroflyFlightToAeroflyMainMcfConverter.js";
import { AeroflyFlightToStringConverter } from "../converter/aerofly-flight/AeroflyFlightToStringConverter.js";
import { AeroflyFlightToAeroflyCustomMissionsTmcConverter } from "../converter/aerofly-flight/AeroflyFlightToAeroflyCustomMissionsTmcConverter.js";
import { AeroflyFlightToGeoJsonConverter } from "../converter/aerofly-flight/AeroflyFlightToGeoJsonConverter.js";
import { AeroflyFlightToKmlConverter } from "../converter/aerofly-flight/AeroflyFlightToKmlConverter.js";

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

    static getConverter(filename: string): new () => AeroflyFlightToStringConverter {
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

    static getRegistry(): Record<string, (new () => AeroflyFlightToStringConverter) | undefined> {
        return {
            [AeroflyFlightToAeroflyMainMcfConverter.fileExtension]: AeroflyFlightToAeroflyMainMcfConverter,
            [AeroflyFlightToAeroflyCustomMissionsTmcConverter.fileExtension]:
                AeroflyFlightToAeroflyCustomMissionsTmcConverter,
            [AeroflyFlightToGeoJsonConverter.fileExtension]: AeroflyFlightToGeoJsonConverter,
            [AeroflyFlightToKmlConverter.fileExtension]: AeroflyFlightToKmlConverter,
        };
    }
}
